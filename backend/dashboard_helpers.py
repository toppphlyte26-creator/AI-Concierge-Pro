"""Dashboard aggregation helpers (kept out of routes.py to reduce complexity)."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict, List, Tuple

from currency import convert


def aggregate_month(txns: List[Dict[str, Any]], month_start: str, base_ccy: str) -> Tuple[float, float, Dict[str, float]]:
    """Compute (income, expense, category_totals) for the current month."""
    income = 0.0
    expense = 0.0
    category_totals: Dict[str, float] = {}
    for t in txns:
        if t["date"] < month_start:
            continue
        base_amt = convert(float(t["amount"]), t.get("currency", "USD"), base_ccy)
        if t["type"] == "income":
            income += base_amt
        else:
            expense += base_amt
            category_totals[t["category"]] = category_totals.get(t["category"], 0.0) + base_amt
    return income, expense, category_totals


def build_trend(txns: List[Dict[str, Any]], base_ccy: str, today: date, months_back: int = 6) -> List[Dict[str, Any]]:
    """Return last N months of income vs expense (base currency)."""
    trend_map: Dict[str, Dict[str, float]] = {}
    for t in txns:
        m = t["date"][:7]
        entry = trend_map.setdefault(m, {"income": 0.0, "expense": 0.0})
        base_amt = convert(float(t["amount"]), t.get("currency", "USD"), base_ccy)
        key = t["type"] if t["type"] in ("income", "expense") else "expense"
        entry[key] += base_amt

    months: List[str] = []
    cursor = today.replace(day=1)
    for _ in range(months_back):
        months.append(cursor.strftime("%Y-%m"))
        prev = cursor - timedelta(days=1)
        cursor = prev.replace(day=1)

    trend: List[Dict[str, Any]] = []
    for m in reversed(months):
        d = trend_map.get(m, {"income": 0.0, "expense": 0.0})
        trend.append({"month": m, "income": round(d["income"], 2), "expense": round(d["expense"], 2)})
    return trend


def enrich_budgets(budgets: List[Dict[str, Any]], category_totals: Dict[str, float]) -> List[Dict[str, Any]]:
    enriched: List[Dict[str, Any]] = []
    for b in budgets:
        spent = category_totals.get(b["category"], 0.0)
        limit = b.get("limit") or 0
        percent = round(min(spent / limit * 100.0, 999.0), 1) if limit else 0.0
        enriched.append({**b, "spent": round(spent, 2), "percent": percent})
    return enriched


def build_category_breakdown(category_totals: Dict[str, float]) -> List[Dict[str, Any]]:
    ordered = sorted(category_totals.items(), key=lambda kv: kv[1], reverse=True)
    return [{"category": c, "amount": round(a, 2)} for c, a in ordered]


def compute_savings_rate(income: float, net: float) -> float:
    return round((net / income * 100.0), 1) if income > 0 else 0.0
