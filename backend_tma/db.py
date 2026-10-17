"""
SQLite Persistence Layer for Telegram AURA Mini App Backend.
Uses parameterized queries (?) and strict URL/text sanitization.
"""

from __future__ import annotations

import re
import sqlite3
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

ALLOWED_SCHEMES = {"http", "https", "tg"}
CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")


def sanitize_text(value: str | None, max_length: int = 2000) -> str:
    """Strips control characters and enforces length limits."""
    if not value or not isinstance(value, str):
        return ""
    cleaned = CONTROL_CHARS_RE.sub("", value)
    cleaned = re.sub(r"<\s*/?\s*script\b[^>]*>", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()[:max_length]


def sanitize_safe_url(url: str | None) -> str | None:
    """
    Validates that a URL uses an allowed scheme ('http:', 'https:', 'tg:')
    and rejects dangerous protocols like 'javascript:', 'data:', or 'vbscript:'.
    """
    if not url or not isinstance(url, str):
        return None
    cleaned = re.sub(r"[\t\r\n]+", "", CONTROL_CHARS_RE.sub("", url)).strip()
    if not cleaned:
        return None

    parsed = urlparse(cleaned)
    scheme = (parsed.scheme or "").lower()
    if scheme not in ALLOWED_SCHEMES:
        raise ValueError(f"Protocolo de URL no permitido: {scheme or 'desconocido'}")

    return cleaned[:2048]


class AuraInboxDatabase:
    """SQLite storage manager for messages voluntarily sent/forwarded to the Telegram Bot."""

    def __init__(self, db_path: str = ":memory:") -> None:
        self.db_path = db_path
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self) -> None:
        with self._conn:
            self._conn.execute(
                """
                CREATE TABLE IF NOT EXISTS forwarded_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    source_url TEXT,
                    chat_name TEXT,
                    author TEXT,
                    created_at TEXT NOT NULL
                )
                """
            )
            self._conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_forwarded_user
                ON forwarded_items (telegram_user_id, id DESC)
                """
            )

    def add_forwarded_item(
        self,
        telegram_user_id: int,
        title: str,
        content: str,
        source_url: str | None = None,
        chat_name: str | None = None,
        author: str | None = None,
        created_at: str | None = None,
    ) -> dict[str, Any]:
        """Inserts a sanitized forwarded message using parameterized SQL."""
        if not (isinstance(telegram_user_id, int) and not isinstance(telegram_user_id, bool) and telegram_user_id > 0):
            raise ValueError("telegram_user_id debe ser un entero positivo.")

        clean_title = sanitize_text(title, max_length=240) or "Nota de Telegram"
        clean_content = sanitize_text(content, max_length=5000)
        clean_url = sanitize_safe_url(source_url) if source_url else None
        clean_chat = sanitize_text(chat_name, max_length=140) or None
        clean_author = sanitize_text(author, max_length=100) or None
        timestamp = created_at or datetime.now(timezone.utc).isoformat()

        with self._conn:
            cursor = self._conn.execute(
                """
                INSERT INTO forwarded_items (
                    telegram_user_id, title, content, source_url, chat_name, author, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    telegram_user_id,
                    clean_title,
                    clean_content,
                    clean_url,
                    clean_chat,
                    clean_author,
                    timestamp,
                ),
            )
            item_id = cursor.lastrowid

        return {
            "id": item_id,
            "telegram_user_id": telegram_user_id,
            "title": clean_title,
            "content": clean_content,
            "source_url": clean_url,
            "chat_name": clean_chat,
            "author": clean_author,
            "created_at": timestamp,
        }

    def list_items_for_user(
        self, telegram_user_id: int, limit: int = 50
    ) -> list[dict[str, Any]]:
        """Retrieves captured messages for a specific verified Telegram user."""
        if not (isinstance(telegram_user_id, int) and not isinstance(telegram_user_id, bool) and telegram_user_id > 0):
            raise ValueError("telegram_user_id debe ser un entero positivo.")
        safe_limit = max(1, min(200, int(limit)))
        cursor = self._conn.execute(
            """
            SELECT id, telegram_user_id, title, content, source_url, chat_name, author, created_at
            FROM forwarded_items
            WHERE telegram_user_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (int(telegram_user_id), safe_limit),
        )
        return [dict(row) for row in cursor.fetchall()]

    def close(self) -> None:
        self._conn.close()
