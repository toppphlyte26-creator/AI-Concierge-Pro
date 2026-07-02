"""Gemini 2.5 Flash helpers for FinSight (proven in /app/test_core.py).

Broken into small helpers so each has low complexity.
"""
from __future__ import annotations

import base64
import json
import logging
import os
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from emergentintegrations.llm.chat import ImageContent, LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logger = logging.getLogger("finsight.ai")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
MODEL_PROVIDER = "gemini"
MODEL_NAME = "gemini-2.5-flash"

ALLOWED_CATEGORIES = [
    "Food & Drink",
    "Groceries",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Health",
    "Travel",
    "Housing",
    "Education",
    "Personal Care",
    "Other",
]


def _new_chat(system_message: str) -> LlmChat:
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"finsight-{uuid.uuid4()}",
        system_message=system_message,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)


def _normalize_category(raw: str) -> str:
    if not raw:
        return "Other"
    raw_clean = raw.strip().strip('"').strip("'")
    for c in ALLOWED_CATEGORIES:
        if c.lower() == raw_clean.lower():
            return c
    for c in ALLOWED_CATEGORIES:
        if c.lower() in raw_clean.lower() or raw_clean.lower() in c.lower():
            return c
    return "Other"


def _extract_json(text: str) -> Dict[str, Any]:
    if not text:
        raise ValueError("Empty LLM response")
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    if fence:
        return json.loads(fence.group(1))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        return json.loads(m.group(0))
    raise ValueError(f"Could not extract JSON: {text[:200]}")


CATEGORIZE_SYSTEM = (
    "You are a strict finance transaction categorizer. "
    "You MUST reply with ONLY one category label from this exact list (case sensitive):\n"
    + "\n".join(f"- {c}" for c in ALLOWED_CATEGORIES)
    + "\n\nNo explanation. No JSON. Just the single label."
)

RECEIPT_SYSTEM = (
    "You are a receipt parser. Given a receipt image, extract the fields and "
    "reply with STRICT JSON only. No prose, no code fences. Schema:\n"
    "{\n"
    '  "merchant": string,\n'
    '  "total_amount": number,\n'
    '  "currency": string (ISO 4217 e.g. USD, EUR, GBP, INR, JPY),\n'
    '  "date": string (YYYY-MM-DD if visible, else empty),\n'
    '  "category": string (choose ONE of: '
    + ", ".join(ALLOWED_CATEGORIES)
    + "),\n"
    '  "items": [ {"name": string, "price": number} ]\n'
    "}\n"
    "If a field is not visible, use empty string for strings, 0 for numbers, [] for items. "
    "Return ONLY the JSON object."
)


# --------------------------- Public helpers ---------------------------------

async def suggest_category(description: str) -> str:
    """Return a normalized category label for the given transaction description."""
    if not EMERGENT_LLM_KEY:
        logger.warning("EMERGENT_LLM_KEY not set; returning 'Other'")
        return "Other"
    try:
        chat = _new_chat(CATEGORIZE_SYSTEM)
        resp = await chat.send_message(
            UserMessage(text=f'Transaction description: "{description}"\nCategory:')
        )
        return _normalize_category(str(resp))
    except Exception as e:
        logger.exception("suggest_category failed: %s", e)
        return "Other"


async def extract_receipt(image_bytes: bytes) -> Dict[str, Any]:
    """Public API — given raw image bytes, return normalized receipt dict."""
    if not EMERGENT_LLM_KEY:
        logger.warning("EMERGENT_LLM_KEY not set; returning empty extraction")
        return _empty_receipt()
    raw = await _call_receipt_model(image_bytes)
    if raw is None:
        return _empty_receipt()
    data = _parse_receipt_response(raw)
    if data is None:
        return _empty_receipt()
    return _normalize_receipt(data)


# --------------------------- Internal helpers -------------------------------

async def _call_receipt_model(image_bytes: bytes) -> str | None:
    try:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        chat = _new_chat(RECEIPT_SYSTEM)
        resp = await chat.send_message(
            UserMessage(
                text="Extract the receipt fields as strict JSON per the schema.",
                file_contents=[ImageContent(image_base64=b64)],
            )
        )
        return str(resp)
    except Exception as e:
        logger.exception("_call_receipt_model failed: %s", e)
        return None


def _parse_receipt_response(text: str) -> Dict[str, Any] | None:
    try:
        return _extract_json(text)
    except Exception as e:
        logger.exception("_parse_receipt_response failed: %s", e)
        return None


def _safe_float(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _normalize_items(raw_items: Any) -> List[Dict[str, Any]]:
    if not isinstance(raw_items, list):
        return []
    result: List[Dict[str, Any]] = []
    for i in raw_items:
        if not isinstance(i, dict):
            continue
        result.append({
            "name": str(i.get("name", "")),
            "price": _safe_float(i.get("price", 0)),
        })
    return result


def _normalize_currency(raw: Any) -> str:
    ccy = (str(raw or "USD")).upper()[:3]
    return ccy or "USD"


def _normalize_receipt(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "merchant": str(data.get("merchant") or ""),
        "total_amount": _safe_float(data.get("total_amount")),
        "currency": _normalize_currency(data.get("currency")),
        "date": str(data.get("date") or ""),
        "category": _normalize_category(str(data.get("category") or "")),
        "items": _normalize_items(data.get("items")),
    }


def _empty_receipt() -> Dict[str, Any]:
    return {
        "merchant": "",
        "total_amount": 0.0,
        "currency": "USD",
        "date": "",
        "category": "Other",
        "items": [],
    }
