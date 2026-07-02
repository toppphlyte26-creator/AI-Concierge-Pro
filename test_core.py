"""
FinSight — Phase 1 POC / Core Test Script

Validates the two Gemini 2.5 Flash workflows we need before building the app:
  1) Text auto-categorization of a transaction description.
  2) Multimodal receipt image -> structured JSON extraction.

Run:  python /app/test_core.py
"""
import asyncio
import base64
import json
import os
import re
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv

# Load backend .env so EMERGENT_LLM_KEY is available.
BACKEND_ENV = Path("/app/backend/.env")
load_dotenv(BACKEND_ENV)

from emergentintegrations.llm.chat import (  # noqa: E402
    LlmChat,
    UserMessage,
    ImageContent,
)

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

RECEIPT_IMAGE_PATH = "/tmp/receipt.jpg"


# ----------------------------- Helpers ---------------------------------------


def _new_chat(system_message: str) -> LlmChat:
    """Create a fresh LlmChat instance (required per session per the playbook)."""
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"finsight-poc-{uuid.uuid4()}",
        system_message=system_message,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)


def _extract_json(text: str) -> dict:
    """Best-effort JSON parse from an LLM response (handles ```json fences etc.)."""
    if not text:
        raise ValueError("Empty LLM response")
    # Strip code fences
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    if fence:
        return json.loads(fence.group(1))
    # Try direct
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Grab first {...} block
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        return json.loads(m.group(0))
    raise ValueError(f"Could not extract JSON from response: {text[:200]}")


def _normalize_category(raw: str) -> str:
    """Snap any string returned by the LLM to the closest allowed category."""
    if not raw:
        return "Other"
    raw_clean = raw.strip().strip('"').strip("'")
    # exact match
    for c in ALLOWED_CATEGORIES:
        if c.lower() == raw_clean.lower():
            return c
    # partial contains
    for c in ALLOWED_CATEGORIES:
        if c.lower() in raw_clean.lower() or raw_clean.lower() in c.lower():
            return c
    return "Other"


# ----------------------------- Test 1: text categorize ------------------------


CATEGORIZE_SYSTEM = (
    "You are a strict finance transaction categorizer. "
    "You MUST reply with ONLY one category label from this exact list (case sensitive):\n"
    + "\n".join(f"- {c}" for c in ALLOWED_CATEGORIES)
    + "\n\nNo explanation. No JSON. Just the single label."
)


async def test_text_categorization() -> bool:
    print("\n[Test 1] Text auto-categorization")
    samples = [
        ("Starbucks coffee downtown", ["Food & Drink"]),
        ("Uber ride to airport", ["Transport", "Travel"]),
        ("Whole Foods weekly grocery run", ["Groceries"]),
        ("Netflix monthly subscription", ["Entertainment", "Bills & Utilities"]),
        ("Electricity bill October", ["Bills & Utilities"]),
    ]
    all_ok = True
    for description, acceptable in samples:
        chat = _new_chat(CATEGORIZE_SYSTEM)
        resp = await chat.send_message(
            UserMessage(text=f'Transaction description: "{description}"\nCategory:')
        )
        raw = str(resp).strip()
        picked = _normalize_category(raw)
        ok = picked in acceptable
        print(f'  "{description}" -> raw={raw!r} normalized={picked!r} '
              f'{"PASS" if ok else "FAIL (expected one of " + str(acceptable) + ")"}')
        if not ok:
            all_ok = False
    print(f"[Test 1] {'PASS' if all_ok else 'FAIL'}")
    return all_ok


# ----------------------------- Test 2: receipt vision -------------------------


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
    '  "items": [ {"name": string, "price": number} ]  // best-effort, may be []\n'
    "}\n"
    "If a field is not visible, use empty string for strings, 0 for numbers, [] for items. "
    "Return ONLY the JSON object."
)


def _image_to_base64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


async def test_receipt_extraction() -> bool:
    print("\n[Test 2] Receipt image -> structured JSON")
    if not Path(RECEIPT_IMAGE_PATH).exists():
        print(f"  MISSING receipt image at {RECEIPT_IMAGE_PATH}")
        return False

    b64 = _image_to_base64(RECEIPT_IMAGE_PATH)
    print(f"  Loaded receipt image ({len(b64)} b64 chars)")

    chat = _new_chat(RECEIPT_SYSTEM)
    msg = UserMessage(
        text="Extract the receipt fields as strict JSON per the schema.",
        file_contents=[ImageContent(image_base64=b64)],
    )
    resp = await chat.send_message(msg)
    text = str(resp)
    print(f"  Raw response (first 400 chars): {text[:400]}")

    try:
        data = _extract_json(text)
    except Exception as e:
        print(f"  FAIL: could not parse JSON ({e})")
        return False

    required = ["merchant", "total_amount", "currency", "date", "category", "items"]
    missing = [k for k in required if k not in data]
    if missing:
        print(f"  FAIL: missing keys {missing}. Got: {data}")
        return False

    # Normalize + validate loosely
    data["category"] = _normalize_category(data.get("category", ""))
    try:
        data["total_amount"] = float(data.get("total_amount") or 0)
    except (TypeError, ValueError):
        data["total_amount"] = 0.0
    if not isinstance(data.get("items"), list):
        data["items"] = []

    print(f"  Parsed: {json.dumps(data, indent=2)}")

    # Loose success criteria — we don't know the exact receipt content, but the
    # model should return non-empty merchant, positive total, valid category.
    ok = bool(data["merchant"]) and data["total_amount"] > 0 and data["category"] in ALLOWED_CATEGORIES
    print(f"[Test 2] {'PASS' if ok else 'FAIL'} (merchant present, total>0, valid category)")
    return ok


# ----------------------------- Runner -----------------------------------------


async def main() -> int:
    if not EMERGENT_LLM_KEY:
        print("ERROR: EMERGENT_LLM_KEY not set in /app/backend/.env")
        return 1
    print(f"Using model: {MODEL_PROVIDER}/{MODEL_NAME}")
    r1 = await test_text_categorization()
    r2 = await test_receipt_extraction()
    print("\n============================")
    print(f"Text categorization : {'PASS' if r1 else 'FAIL'}")
    print(f"Receipt extraction  : {'PASS' if r2 else 'FAIL'}")
    print("============================")
    return 0 if (r1 and r2) else 2


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
