"""
Optional FastAPI Server for Telegram AURA — Constellations Mini App.
Provides:
  - GET  /health
  - POST /api/tma/verify
  - POST /api/bot/webhook
  - GET  /api/tma/inbox

Designed with graceful fallback so importing this module or running `unittest`
succeeds even in environments where FastAPI is not installed.
"""

from __future__ import annotations

import hmac
import os
from typing import Any

from .db import AuraInboxDatabase
from .telegram_auth import validate_telegram_init_data

DEFAULT_DB_PATH = os.environ.get("AURA_SQLITE_PATH", ":memory:")
inbox_db = AuraInboxDatabase(os.environ.get("AURA_SQLITE_MEMORY", DEFAULT_DB_PATH))


def get_bot_token() -> str:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN no está definido en las variables de entorno."
        )
    return token


def verify_webhook_secret(
    received_secret: str | None, expected_secret: str | None = None
) -> None:
    """
    Validates X-Telegram-Bot-Api-Secret-Token using constant-time comparison.
    Raises PermissionError if expected_secret (or TELEGRAM_WEBHOOK_SECRET) is set and does not match.
    """
    secret = (
        expected_secret
        if expected_secret is not None
        else os.environ.get("TELEGRAM_WEBHOOK_SECRET", "")
    ).strip()
    if not secret:
        return
    if not received_secret or not isinstance(received_secret, str):
        raise PermissionError("Token secreto del webhook ausente o inválido.")
    if not hmac.compare_digest(received_secret.strip(), secret):
        raise PermissionError("Token secreto del webhook inválido.")


def process_bot_webhook_payload(
    update: dict[str, Any], db: AuraInboxDatabase | None = None
) -> dict[str, Any] | None:
    """
    Processes a Telegram Bot webhook update where a user voluntarily forwards
    or sends a message/idea to their personal AURA Bot.
    """
    target_db = db or inbox_db
    message = update.get("message") or update.get("edited_message")
    if not isinstance(message, dict):
        return None

    from_user = message.get("from") or {}
    user_id = from_user.get("id")
    if not (isinstance(user_id, int) and not isinstance(user_id, bool) and user_id > 0):
        return None

    text = message.get("text") or message.get("caption") or ""
    if not text.strip():
        return None

    first_line = text.strip().split("\n")[0][:120]
    title = first_line if len(first_line) <= 68 else f"{first_line[:65]}…"

    forward_chat = message.get("forward_from_chat") or {}
    forward_user = message.get("forward_from") or {}
    chat_name = forward_chat.get("title") or forward_chat.get("username")
    author = (
        forward_user.get("username")
        or forward_user.get("first_name")
        or from_user.get("username")
    )
    if author and not str(author).startswith("@") and " " not in str(author):
        author = f"@{author}"

    entities = message.get("entities") or []
    source_url: str | None = None
    for entity in entities:
        if isinstance(entity, dict) and entity.get("type") == "text_link":
            source_url = entity.get("url")
            break

    return target_db.add_forwarded_item(
        telegram_user_id=user_id,
        title=title,
        content=text,
        source_url=source_url,
        chat_name=chat_name,
        author=author,
    )


try:
    from fastapi import FastAPI, Header, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel

    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    FastAPI = None  # type: ignore


if FASTAPI_AVAILABLE:

    class VerifyInitDataRequest(BaseModel):
        initData: str

    app = FastAPI(
        title="Telegram AURA — Constellations TMA Backend",
        version="1.0.0",
        description="Backend opcional para verificación HMAC-SHA256 de initData y captura vía Bot.",
    )

    allowed_origins = [
        origin.strip()
        for origin in os.environ.get(
            "AURA_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=[
            "Content-Type",
            "X-Telegram-Init-Data",
            "X-Telegram-Bot-Api-Secret-Token",
        ],
    )

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok", "service": "telegram-aura-tma-backend"}

    @app.post("/api/tma/verify")
    def verify_tma_session(payload: VerifyInitDataRequest) -> dict[str, Any]:
        try:
            bot_token = get_bot_token()
            verified = validate_telegram_init_data(payload.initData, bot_token)
            return {"ok": True, "user": verified.get("user"), "auth_date": verified.get("auth_date")}
        except ValueError as exc:
            raise HTTPException(status_code=401, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    @app.post("/api/bot/webhook")
    def telegram_bot_webhook(
        update: dict[str, Any],
        x_telegram_bot_api_secret_token: str | None = Header(
            default=None, alias="X-Telegram-Bot-Api-Secret-Token"
        ),
    ) -> dict[str, Any]:
        try:
            verify_webhook_secret(x_telegram_bot_api_secret_token)
            saved = process_bot_webhook_payload(update, db=inbox_db)
            return {"ok": True, "captured": saved is not None, "item": saved}
        except PermissionError as exc:
            raise HTTPException(status_code=403, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.get("/api/tma/inbox")
    def get_user_inbox(
        x_telegram_init_data: str = Header(..., alias="X-Telegram-Init-Data"),
    ) -> dict[str, Any]:
        try:
            bot_token = get_bot_token()
            verified = validate_telegram_init_data(x_telegram_init_data, bot_token)
            user_obj = verified.get("user") or {}
            user_id = user_obj.get("id")
            if not (isinstance(user_id, int) and not isinstance(user_id, bool) and user_id > 0):
                raise HTTPException(
                    status_code=401,
                    detail="El initData verificado no contiene un user.id válido.",
                )
            items = inbox_db.list_items_for_user(user_id)
            return {"ok": True, "items": items}
        except ValueError as exc:
            raise HTTPException(status_code=401, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

else:
    app = None
