"""Seed sample data for a newly-registered user.

Uses `secrets` for random amount / date jitter as flagged by lint. The values
are purely cosmetic (demo data) but stronger entropy is harmless.
"""
from __future__ import annotations

import secrets
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List

from db import db


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


_SAMPLE_TXNS = [
    ("Blue Bottle Coffee", 4, 9, "USD", "expense", "Food & Drink"),
    ("Chipotle lunch", 10, 16, "USD", "expense", "Food & Drink"),
    ("Sushi dinner", 22, 45, "USD", "expense", "Food & Drink"),
    ("Whole Foods groceries", 45, 130, "USD", "expense", "Groceries"),
    ("Trader Joe's run", 25, 80, "USD", "expense", "Groceries"),
    ("Uber ride downtown", 8, 22, "USD", "expense", "Transport"),
    ("Lyft to airport", 30, 60, "USD", "expense", "Transport"),
    ("BART commute", 3, 5, "USD", "expense", "Transport"),
    ("Amazon order", 25, 120, "USD", "expense", "Shopping"),
    ("Nike shoes", 90, 180, "USD", "expense", "Shopping"),
    ("Netflix subscription", 15.49, 15.49, "USD", "expense", "Entertainment"),
    ("Spotify Premium", 11.99, 11.99, "USD", "expense", "Entertainment"),
    ("Movie tickets", 18, 32, "USD", "expense", "Entertainment"),
    ("PG&E electricity bill", 60, 140, "USD", "expense", "Bills & Utilities"),
    ("Comcast internet", 79.99, 79.99, "USD", "expense", "Bills & Utilities"),
    ("Verizon phone", 55, 65, "USD", "expense", "Bills & Utilities"),
    ("Gym membership", 39.99, 39.99, "USD", "expense", "Health"),
    ("Pharmacy - Walgreens", 8, 45, "USD", "expense", "Health"),
    ("Flight to NYC", 220, 480, "USD", "expense", "Travel"),
    ("Airbnb Weekend Getaway", 180, 380, "USD", "expense", "Travel"),
    ("Rent - March", 1800, 2200, "USD", "expense", "Housing"),
    ("Haircut", 25, 55, "USD", "expense", "Personal Care"),
    ("Coursera course", 49, 49, "USD", "expense", "Education"),
    ("Monthly salary", 5200, 5200, "USD", "income", "Salary"),
    ("Freelance project", 800, 1400, "USD", "income", "Freelance"),
    ("Dividend payout", 40, 120, "USD", "income", "Investment"),
]


def _rand_amount(lo: float, hi: float) -> float:
    if hi <= lo:
        return round(lo, 2)
    # secrets doesn't give float uniform — approximate via randbelow on centicents.
    span_cents = int(round((hi - lo) * 100))
    offset = secrets.randbelow(span_cents + 1) / 100.0
    return round(lo + offset, 2)


def _rand_date_within(days_back: int = 75) -> str:
    delta = secrets.randbelow(days_back + 1)
    return (date.today() - timedelta(days=delta)).isoformat()


async def seed_for_user(user_id: str, base_currency: str = "USD") -> None:
    """Insert sample transactions, budgets, bills, and goals for user."""
    txns: List[Dict[str, Any]] = []
    for desc, lo, hi, ccy, typ, cat in _SAMPLE_TXNS:
        occurrences = 2 if typ == "expense" and secrets.randbelow(2) else 1
        for _ in range(occurrences):
            txns.append(
                {
                    "id": _uuid(),
                    "user_id": user_id,
                    "description": desc,
                    "merchant": desc,
                    "amount": _rand_amount(lo, hi),
                    "currency": ccy,
                    "category": cat,
                    "date": _rand_date_within(75),
                    "type": typ,
                    "notes": None,
                    "created_at": _now().isoformat(),
                }
            )
    if txns:
        await db.transactions.insert_many(txns)

    current_month = date.today().strftime("%Y-%m")
    budgets = [
        {"category": "Food & Drink", "limit": 400.0},
        {"category": "Groceries", "limit": 500.0},
        {"category": "Transport", "limit": 200.0},
        {"category": "Entertainment", "limit": 150.0},
        {"category": "Shopping", "limit": 300.0},
    ]
    await db.budgets.insert_many(
        [
            {
                "id": _uuid(),
                "user_id": user_id,
                "category": b["category"],
                "limit": b["limit"],
                "month": current_month,
                "created_at": _now().isoformat(),
            }
            for b in budgets
        ]
    )

    today = date.today()
    bills = [
        ("Netflix", 15.49, "monthly", 8, "Entertainment"),
        ("Spotify Premium", 11.99, "monthly", 14, "Entertainment"),
        ("Comcast Internet", 79.99, "monthly", 5, "Bills & Utilities"),
        ("Rent", 2000.0, "monthly", 1, "Housing"),
        ("Gym Membership", 39.99, "monthly", 22, "Health"),
    ]
    await db.bills.insert_many(
        [
            {
                "id": _uuid(),
                "user_id": user_id,
                "name": n,
                "amount": amt,
                "currency": "USD",
                "frequency": freq,
                "next_due_date": (today + timedelta(days=days)).isoformat(),
                "category": cat,
                "created_at": _now().isoformat(),
            }
            for (n, amt, freq, days, cat) in bills
        ]
    )

    goals = [
        ("Emergency Fund", 10000, 3200, 180),
        ("Japan Trip 2026", 5000, 1650, 220),
        ("New Laptop", 2500, 900, 90),
    ]
    await db.goals.insert_many(
        [
            {
                "id": _uuid(),
                "user_id": user_id,
                "name": n,
                "target_amount": float(t),
                "current_amount": float(c),
                "currency": "USD",
                "target_date": (today + timedelta(days=days)).isoformat(),
                "created_at": _now().isoformat(),
            }
            for (n, t, c, days) in goals
        ]
    )
