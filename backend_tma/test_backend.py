"""
Unit and security tests for the Telegram Mini App backend (`backend_tma`).
Executable with standard library only:
    python3 -m unittest discover -s backend_tma -p "test_*.py" -v
"""

from __future__ import annotations

import hashlib
import hmac
import json
import unittest
from urllib.parse import urlencode

from backend_tma.app import DEFAULT_DB_PATH, process_bot_webhook_payload, verify_webhook_secret
from backend_tma.db import AuraInboxDatabase, sanitize_safe_url, sanitize_text
from backend_tma.telegram_auth import validate_telegram_init_data

TEST_BOT_TOKEN = "123456789:AAH_test_bot_secret_token_for_hmac_verification"


def build_signed_init_data(
    bot_token: str,
    user_payload: dict,
    auth_date: int,
    query_id: str = "AAHdF6IQAAAAAN0XohDhrOrc",
) -> str:
    """Helper to generate a cryptographically valid Telegram Mini App initData string."""
    params = {
        "auth_date": str(auth_date),
        "query_id": query_id,
        "user": json.dumps(user_payload, separators=(",", ":")),
    }
    data_check_string = "\n".join(f"{k}={params[k]}" for k in sorted(params.keys()))
    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    signature = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    params["hash"] = signature
    return urlencode(params)


class TestTelegramMiniAppBackend(unittest.TestCase):
    def test_valid_hmac_sha256_init_data(self) -> None:
        now = 1760000000
        user = {
            "id": 99887766,
            "first_name": "Elena",
            "username": "elena_design",
            "language_code": "es",
        }
        init_data = build_signed_init_data(TEST_BOT_TOKEN, user, auth_date=now - 120)

        verified = validate_telegram_init_data(
            init_data=init_data,
            bot_token=TEST_BOT_TOKEN,
            max_age_seconds=86400,
            current_timestamp=now,
        )

        self.assertEqual(verified["auth_date"], now - 120)
        self.assertEqual(verified["user"]["id"], 99887766)
        self.assertEqual(verified["user"]["username"], "elena_design")

    def test_rejects_tampered_signature_or_payload(self) -> None:
        now = 1760000000
        user = {"id": 99887766, "first_name": "Elena"}
        init_data = build_signed_init_data(TEST_BOT_TOKEN, user, auth_date=now - 30)

        # Tamper with the user id inside init_data without updating the HMAC hash
        tampered = init_data.replace("99887766", "11111111")
        with self.assertRaises(ValueError) as ctx:
            validate_telegram_init_data(
                init_data=tampered,
                bot_token=TEST_BOT_TOKEN,
                current_timestamp=now,
            )
        self.assertIn("HMAC-SHA256", str(ctx.exception))

    def test_rejects_expired_auth_date_replay_attack(self) -> None:
        now = 1760000000
        expired_auth_date = now - 90000  # Older than 86400s (24h)
        user = {"id": 445566, "first_name": "Marco"}
        init_data = build_signed_init_data(
            TEST_BOT_TOKEN, user, auth_date=expired_auth_date
        )

        with self.assertRaises(ValueError) as ctx:
            validate_telegram_init_data(
                init_data=init_data,
                bot_token=TEST_BOT_TOKEN,
                max_age_seconds=86400,
                current_timestamp=now,
            )
        self.assertIn("expirado", str(ctx.exception))

    def test_sqlite_parameterized_storage_and_url_security(self) -> None:
        db = AuraInboxDatabase(":memory:")
        try:
            saved = db.add_forwarded_item(
                telegram_user_id=99887766,
                title="Especificación TMA 8.0 <script>alert(1)</script>",
                content="Revisar documentación oficial'; DROP TABLE forwarded_items; --",
                source_url="https://core.telegram.org/bots/webapps",
                chat_name="Design Systems TG",
                author="@elena_design",
            )
            self.assertNotIn("<script>", saved["title"])
            self.assertEqual(saved["source_url"], "https://core.telegram.org/bots/webapps")

            items = db.list_items_for_user(99887766)
            self.assertEqual(len(items), 1)
            self.assertEqual(items[0]["author"], "@elena_design")

            # Verify malicious javascript: URLs are strictly blocked
            with self.assertRaises(ValueError):
                db.add_forwarded_item(
                    telegram_user_id=99887766,
                    title="Enlace malicioso",
                    content="Intento XSS",
                    source_url="javascript:alert(document.cookie)",
                )

            # Verify webhook processor integration with in-memory DB
            webhook_result = process_bot_webhook_payload(
                {
                    "message": {
                        "from": {"id": 99887766, "username": "elena_design"},
                        "forward_from_chat": {"title": "Canal Arquitectura"},
                        "text": "Idea clave sobre grafos espaciales en lienzo infinito",
                    }
                },
                db=db,
            )
            self.assertIsNotNone(webhook_result)
            updated_items = db.list_items_for_user(99887766)
            self.assertEqual(len(updated_items), 2)
        finally:
            db.close()

    def test_wh01_webhook_secret_and_default_in_memory_db(self) -> None:
        self.assertEqual(DEFAULT_DB_PATH, ":memory:")
        # When expected_secret is empty/unset, no error is raised
        verify_webhook_secret(None, expected_secret="")
        # When expected_secret is set, matching secret passes
        verify_webhook_secret("my-secret-token-123", expected_secret="my-secret-token-123")
        # Mismatched or missing secret raises PermissionError
        with self.assertRaises(PermissionError):
            verify_webhook_secret("wrong-token", expected_secret="my-secret-token-123")
        with self.assertRaises(PermissionError):
            verify_webhook_secret(None, expected_secret="my-secret-token-123")

    def test_wh02_url_and_text_whitespace_obfuscation_sanitization(self) -> None:
        with self.assertRaises(ValueError):
            sanitize_safe_url("java\tscript:alert(1)")
        with self.assertRaises(ValueError):
            sanitize_safe_url("java\n\rscript:alert(1)")
        cleaned = sanitize_text("Click j\ta\nv a s c r i p t :alert(1) ahora")
        self.assertNotIn("javascript:", cleaned.lower().replace(" ", ""))
        self.assertIn("alert(1)", cleaned)

    def test_wh04_rejects_boolean_user_id_and_non_hex64_hash(self) -> None:
        db = AuraInboxDatabase(":memory:")
        try:
            with self.assertRaises(ValueError):
                db.add_forwarded_item(
                    telegram_user_id=True,  # type: ignore[arg-type]
                    title="Bool user",
                    content="Test",
                )
            with self.assertRaises(ValueError):
                db.list_items_for_user(True)  # type: ignore[arg-type]

            res = process_bot_webhook_payload(
                {"message": {"from": {"id": True}, "text": "Hola"}}, db=db
            )
            self.assertIsNone(res)
        finally:
            db.close()

        # Non-hex or wrong-length hash in init_data
        with self.assertRaises(ValueError) as ctx:
            validate_telegram_init_data(
                init_data="auth_date=1760000000&user=%7B%22id%22%3A123%7D&hash=not_a_64_char_hex",
                bot_token=TEST_BOT_TOKEN,
                current_timestamp=1760000000,
            )
        self.assertIn("64 caracteres hexadecimales", str(ctx.exception))

        # Signed init_data with boolean user.id must be rejected
        now = 1760000000
        bool_user_init = build_signed_init_data(
            TEST_BOT_TOKEN, {"id": True, "first_name": "Bot"}, auth_date=now - 10
        )
        with self.assertRaises(ValueError) as ctx2:
            validate_telegram_init_data(
                init_data=bool_user_init,
                bot_token=TEST_BOT_TOKEN,
                current_timestamp=now,
            )
        self.assertIn("entero positivo", str(ctx2.exception))


if __name__ == "__main__":
    unittest.main()
