"""
Telegram Mini Apps (TMA) Official Cryptographic Authentication Validator.
Implements HMAC-SHA256 verification of `initData` with replay-attack protection.
Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""

from __future__ import annotations

import hashlib
import hmac
import json
import re
import time
from typing import Any
from urllib.parse import parse_qsl

HEX64_RE = re.compile(r"^[0-9a-fA-F]{64}$")


def validate_telegram_init_data(
    init_data: str,
    bot_token: str,
    max_age_seconds: int = 86400,
    current_timestamp: int | None = None,
) -> dict[str, Any]:
    """
    Validates the cryptographic signature and freshness of Telegram Mini App `initData`.

    Args:
        init_data: Raw URL-encoded query string from `window.Telegram.WebApp.initData`.
        bot_token: Secret Telegram Bot Token (`TELEGRAM_BOT_TOKEN`).
        max_age_seconds: Maximum allowed age in seconds for `auth_date` (default: 24h).
        current_timestamp: Optional override for current UNIX timestamp (used in tests).

    Returns:
        Dictionary containing parsed fields (including decoded `user` object if present).

    Raises:
        ValueError: If `init_data` or `bot_token` is empty, missing required fields,
                    expired, or has an invalid HMAC-SHA256 signature.
    """
    if not init_data or not isinstance(init_data, str) or not init_data.strip():
        raise ValueError("init_data está vacío o no es válido.")

    if not bot_token or not isinstance(bot_token, str) or not bot_token.strip():
        raise ValueError("bot_token no configurado.")

    parsed_pairs = parse_qsl(init_data, keep_blank_values=True)
    if not parsed_pairs:
        raise ValueError("Formato de init_data inválido.")

    data_dict: dict[str, str] = {}
    received_hash: str | None = None

    for key, value in parsed_pairs:
        if key == "hash":
            received_hash = value
        else:
            data_dict[key] = value

    if not received_hash:
        raise ValueError("Falta el parámetro criptográfico 'hash' en init_data.")

    if not HEX64_RE.match(received_hash):
        raise ValueError("El parámetro 'hash' debe contener 64 caracteres hexadecimales válidos.")

    if "auth_date" not in data_dict:
        raise ValueError("Falta el parámetro obligatorio 'auth_date' en init_data.")

    try:
        auth_date = int(data_dict["auth_date"])
    except (TypeError, ValueError) as exc:
        raise ValueError("El parámetro 'auth_date' no es un entero UNIX válido.") from exc

    now = int(current_timestamp if current_timestamp is not None else time.time())

    if auth_date > now + 300:
        raise ValueError("El parámetro 'auth_date' está en el futuro.")

    if max_age_seconds > 0 and (now - auth_date) > max_age_seconds:
        raise ValueError("La sesión de init_data ha expirado (protección anti-replay).")

    # Construct data_check_string sorting keys alphabetically
    data_check_string = "\n".join(
        f"{k}={data_dict[k]}" for k in sorted(data_dict.keys())
    )

    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash.lower()):
        raise ValueError("Firma HMAC-SHA256 de init_data inválida o manipulada.")

    result: dict[str, Any] = dict(data_dict)
    result["auth_date"] = auth_date

    if "user" in result and isinstance(result["user"], str):
        try:
            parsed_user = json.loads(result["user"])
        except json.JSONDecodeError as exc:
            raise ValueError("El objeto 'user' en init_data no es JSON válido.") from exc
        if not isinstance(parsed_user, dict):
            raise ValueError("El objeto 'user' en init_data debe ser un diccionario JSON.")
        user_id = parsed_user.get("id")
        if user_id is not None and not (
            isinstance(user_id, int) and not isinstance(user_id, bool) and user_id > 0
        ):
            raise ValueError("El campo 'user.id' en init_data debe ser un entero positivo.")
        result["user"] = parsed_user

    return result
