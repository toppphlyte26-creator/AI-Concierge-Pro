"""Consolidated FinSight API routes.

All routes are registered under the /api prefix in server.py.
"""
from __future__ import annotations

import io
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from PIL import Image

from ai_service import extract_receipt, suggest_category
from auth import create_token, get_current_user, hash_password, verify_password
from currency import RATES_TO_USD_INVERSE, SUPPORTED, convert
from db import db
from models import (
    ALLOWED_CATEGORIES,
    AuthResponse,
    Bill,
    BillCreate,
    BillUpdate,
    Budget,
    BudgetCreate,
    BudgetUpdate,
    CategorySuggestRequest,
    Goal,
    GoalContribution,
    GoalCreate,
    GoalUpdate,
    ReceiptExtracted,
    Transaction,
    TransactionCreate,
    TransactionUpdate,
    UpdateSettings,
    UserLogin,
    UserPublic,
    UserSignup,
    SUPPORTED_CURRENCIES,
)
from seed import seed_for_user

logger = logging.getLogger("finsight.routes")
router = APIRouter()


def _uuid() -> str:
    import uuid as _u

    return str(_u.uuid4())


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ------------------------------- Health / Meta --------------------------------
@router.get("/")
async def root() -> Dict[str, str]:
    return {"message": "FinSight API"}


@router.get("/meta/categories")
async def meta_categories() -> Dict[str, Any]:
    return {"categories": ALLOWED_CATEGORIES, "currencies": SUPPORTED_CURRENCIES}


# ---------------------------------- Auth --------------------------------------
@router.post("/auth/signup", response_model=AuthResponse)
async def signup(payload: UserSignup) -> AuthResponse:
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = _uuid()
    doc = {
        "id": user_id,
        "email": payload.email.lower(),
        "name": payload.name or payload.email.split("@")[0].title(),
        "password_hash": hash_password(payload.password),
        "base_currency": "USD",
        "created_at": _now_iso(),
    }
    await db.users.insert_one(doc)
    # Seed sample data so the app looks alive immediately.
    try:
        await seed_for_user(user_id)
    except Exception as e:
        logger.exception("Seed failed for %s: %s", user_id, e)

    token = create_token(user_id)
    public = {k: v for k, v in doc.items() if k != "password_hash"}
    public["created_at"] = datetime.fromisoformat(public["created_at"])
    return AuthResponse(token=token, user=UserPublic(**public))


@router.post("/auth/login", response_model=AuthResponse)
async def login(payload: UserLogin) -> AuthResponse:
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    public = {k: v for k, v in user.items() if k != "password_hash"}
    if isinstance(public.get("created_at"), str):
        public["created_at"] = datetime.fromisoformat(public["created_at"])
    return AuthResponse(token=token, user=UserPublic(**public))


@router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)) -> UserPublic:
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return UserPublic(**user)


@router.patch("/auth/me", response_model=UserPublic)
async def update_me(
    payload: UpdateSettings, user: dict = Depends(get_current_user)
) -> UserPublic:
    updates: Dict[str, Any] = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.base_currency is not None:
        if payload.base_currency not in SUPPORTED_CURRENCIES:
            raise HTTPException(status_code=400, detail="Unsupported currency")
        updates["base_currency"] = payload.base_currency
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    fresh = await db.users.find_one(
        {"id": user["id"]}, {"_id": 0, "password_hash": 0}
    )
    if isinstance(fresh.get("created_at"), str):
        fresh["created_at"] = datetime.fromisoformat(fresh["created_at"])
    return UserPublic(**fresh)


# ------------------------------ Transactions ----------------------------------
@router.get("/transactions", response_model=List[Transaction])
async def list_transactions(
    user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None),
    currency: Optional[str] = Query(None),
    tx_type: Optional[str] = Query(None, alias="type"),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    limit: int = Query(500, ge=1, le=2000),
) -> List[Transaction]:
    q: Dict[str, Any] = {"user_id": user["id"]}
    if category:
        q["category"] = category
    if currency:
        q["currency"] = currency
    if tx_type:
        q["type"] = tx_type
    if from_date or to_date:
        q["date"] = {}
        if from_date:
            q["date"]["$gte"] = from_date
        if to_date:
            q["date"]["$lte"] = to_date
    docs = (
        await db.transactions.find(q, {"_id": 0}).sort("date", -1).to_list(limit)
    )
    return [Transaction(**d) for d in docs]


@router.post("/transactions", response_model=Transaction)
async def create_transaction(
    payload: TransactionCreate, user: dict = Depends(get_current_user)
) -> Transaction:
    cat = payload.category
    if not cat:
        cat = await suggest_category(payload.description)
    doc = {
        "id": _uuid(),
        "user_id": user["id"],
        "description": payload.description,
        "amount": float(payload.amount),
        "currency": payload.currency or "USD",
        "category": cat or "Other",
        "date": payload.date or date.today().isoformat(),
        "type": payload.type or "expense",
        "notes": payload.notes,
        "merchant": payload.merchant or payload.description,
        "created_at": _now_iso(),
    }
    await db.transactions.insert_one(doc)
    return Transaction(**doc)


@router.patch("/transactions/{tx_id}", response_model=Transaction)
async def update_transaction(
    tx_id: str,
    payload: TransactionUpdate,
    user: dict = Depends(get_current_user),
) -> Transaction:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No changes")
    result = await db.transactions.update_one(
        {"id": tx_id, "user_id": user["id"]}, {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    doc = await db.transactions.find_one({"id": tx_id}, {"_id": 0})
    return Transaction(**doc)


@router.delete("/transactions/{tx_id}")
async def delete_transaction(
    tx_id: str, user: dict = Depends(get_current_user)
) -> Dict[str, bool]:
    result = await db.transactions.delete_one({"id": tx_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"ok": True}


# ------------------------------ AI helpers ------------------------------------
@router.post("/ai/categorize")
async def ai_categorize(
    payload: CategorySuggestRequest, user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    cat = await suggest_category(payload.description)
    return {"category": cat}


@router.post("/receipts/scan", response_model=ReceiptExtracted)
async def scan_receipt(
    file: UploadFile = File(...), user: dict = Depends(get_current_user)
) -> ReceiptExtracted:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    # Normalize: transcode to JPEG, resize if huge, RGB.
    try:
        with Image.open(io.BytesIO(raw)) as im:
            im = im.convert("RGB")
            im.thumbnail((1600, 1600))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=90)
            image_bytes = buf.getvalue()
    except Exception as e:
        logger.exception("Bad image: %s", e)
        raise HTTPException(status_code=400, detail="Could not read image") from e
    data = await extract_receipt(image_bytes)
    return ReceiptExtracted(**data)


# --------------------------------- Budgets ------------------------------------
@router.get("/budgets", response_model=List[Budget])
async def list_budgets(
    user: dict = Depends(get_current_user),
    month: Optional[str] = Query(None),
) -> List[Budget]:
    q: Dict[str, Any] = {"user_id": user["id"]}
    if month:
        q["month"] = month
    docs = await db.budgets.find(q, {"_id": 0}).to_list(500)
    return [Budget(**d) for d in docs]


@router.post("/budgets", response_model=Budget)
async def create_budget(
    payload: BudgetCreate, user: dict = Depends(get_current_user)
) -> Budget:
    # Upsert per (user, category, month)
    existing = await db.budgets.find_one(
        {"user_id": user["id"], "category": payload.category, "month": payload.month}
    )
    if existing:
        await db.budgets.update_one(
            {"id": existing["id"]}, {"$set": {"limit": float(payload.limit)}}
        )
        existing["limit"] = float(payload.limit)
        existing.pop("_id", None)
        return Budget(**existing)
    doc = {
        "id": _uuid(),
        "user_id": user["id"],
        "category": payload.category,
        "limit": float(payload.limit),
        "month": payload.month,
        "created_at": _now_iso(),
    }
    await db.budgets.insert_one(doc)
    return Budget(**doc)


@router.patch("/budgets/{budget_id}", response_model=Budget)
async def update_budget(
    budget_id: str, payload: BudgetUpdate, user: dict = Depends(get_current_user)
) -> Budget:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No changes")
    result = await db.budgets.update_one(
        {"id": budget_id, "user_id": user["id"]}, {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    doc = await db.budgets.find_one({"id": budget_id}, {"_id": 0})
    return Budget(**doc)


@router.delete("/budgets/{budget_id}")
async def delete_budget(
    budget_id: str, user: dict = Depends(get_current_user)
) -> Dict[str, bool]:
    r = await db.budgets.delete_one({"id": budget_id, "user_id": user["id"]})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"ok": True}


# ---------------------------------- Bills -------------------------------------
@router.get("/bills", response_model=List[Bill])
async def list_bills(user: dict = Depends(get_current_user)) -> List[Bill]:
    docs = (
        await db.bills.find({"user_id": user["id"]}, {"_id": 0})
        .sort("next_due_date", 1)
        .to_list(500)
    )
    return [Bill(**d) for d in docs]


@router.post("/bills", response_model=Bill)
async def create_bill(
    payload: BillCreate, user: dict = Depends(get_current_user)
) -> Bill:
    doc = {
        "id": _uuid(),
        "user_id": user["id"],
        "name": payload.name,
        "amount": float(payload.amount),
        "currency": payload.currency or "USD",
        "frequency": payload.frequency or "monthly",
        "next_due_date": payload.next_due_date,
        "category": payload.category or "Bills & Utilities",
        "created_at": _now_iso(),
    }
    await db.bills.insert_one(doc)
    return Bill(**doc)


@router.patch("/bills/{bill_id}", response_model=Bill)
async def update_bill(
    bill_id: str, payload: BillUpdate, user: dict = Depends(get_current_user)
) -> Bill:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No changes")
    r = await db.bills.update_one(
        {"id": bill_id, "user_id": user["id"]}, {"$set": updates}
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    doc = await db.bills.find_one({"id": bill_id}, {"_id": 0})
    return Bill(**doc)


@router.delete("/bills/{bill_id}")
async def delete_bill(
    bill_id: str, user: dict = Depends(get_current_user)
) -> Dict[str, bool]:
    r = await db.bills.delete_one({"id": bill_id, "user_id": user["id"]})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"ok": True}


# ---------------------------------- Goals -------------------------------------
@router.get("/goals", response_model=List[Goal])
async def list_goals(user: dict = Depends(get_current_user)) -> List[Goal]:
    docs = await db.goals.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    return [Goal(**d) for d in docs]


@router.post("/goals", response_model=Goal)
async def create_goal(
    payload: GoalCreate, user: dict = Depends(get_current_user)
) -> Goal:
    doc = {
        "id": _uuid(),
        "user_id": user["id"],
        "name": payload.name,
        "target_amount": float(payload.target_amount),
        "current_amount": float(payload.current_amount or 0),
        "currency": payload.currency or "USD",
        "target_date": payload.target_date,
        "created_at": _now_iso(),
    }
    await db.goals.insert_one(doc)
    return Goal(**doc)


@router.patch("/goals/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: str, payload: GoalUpdate, user: dict = Depends(get_current_user)
) -> Goal:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No changes")
    r = await db.goals.update_one(
        {"id": goal_id, "user_id": user["id"]}, {"$set": updates}
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    doc = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return Goal(**doc)


@router.post("/goals/{goal_id}/contribute", response_model=Goal)
async def contribute_goal(
    goal_id: str,
    payload: GoalContribution,
    user: dict = Depends(get_current_user),
) -> Goal:
    r = await db.goals.update_one(
        {"id": goal_id, "user_id": user["id"]},
        {"$inc": {"current_amount": float(payload.amount)}},
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    doc = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return Goal(**doc)


@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: str, user: dict = Depends(get_current_user)
) -> Dict[str, bool]:
    r = await db.goals.delete_one({"id": goal_id, "user_id": user["id"]})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"ok": True}


# -------------------------------- Dashboard -----------------------------------
@router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    """Aggregated dashboard payload — KPIs + charts + progress."""
    base_ccy: str = user.get("base_currency", "USD") or "USD"
    today = date.today()
    month_start = today.replace(day=1).isoformat()
    six_months_ago = (today.replace(day=1) - timedelta(days=180)).isoformat()

    # Pull all txns for last ~7 months once; aggregate in-Python for base currency.
    txns = await db.transactions.find(
        {"user_id": user["id"], "date": {"$gte": six_months_ago}}, {"_id": 0}
    ).to_list(5000)

    # This month totals
    month_income = 0.0
    month_expense = 0.0
    category_totals: Dict[str, float] = {}
    for t in txns:
        base_amt = convert(float(t["amount"]), t.get("currency", "USD"), base_ccy)
        if t["date"] >= month_start:
            if t["type"] == "income":
                month_income += base_amt
            else:
                month_expense += base_amt
                category_totals[t["category"]] = (
                    category_totals.get(t["category"], 0.0) + base_amt
                )

    net = month_income - month_expense
    savings_rate = (net / month_income * 100.0) if month_income > 0 else 0.0

    # 6-month trend
    trend_map: Dict[str, Dict[str, float]] = {}
    for t in txns:
        m = t["date"][:7]  # YYYY-MM
        entry = trend_map.setdefault(m, {"income": 0.0, "expense": 0.0})
        base_amt = convert(float(t["amount"]), t.get("currency", "USD"), base_ccy)
        entry[t["type"] if t["type"] in ("income", "expense") else "expense"] += base_amt
    # last 6 calendar months
    trend: List[Dict[str, Any]] = []
    cursor = today.replace(day=1)
    months: List[str] = []
    for _ in range(6):
        months.append(cursor.strftime("%Y-%m"))
        # go to previous month
        prev = cursor - timedelta(days=1)
        cursor = prev.replace(day=1)
    for m in reversed(months):
        d = trend_map.get(m, {"income": 0.0, "expense": 0.0})
        trend.append(
            {
                "month": m,
                "income": round(d["income"], 2),
                "expense": round(d["expense"], 2),
            }
        )

    # Category breakdown for the current month
    category_breakdown = [
        {"category": c, "amount": round(a, 2)}
        for c, a in sorted(category_totals.items(), key=lambda kv: kv[1], reverse=True)
    ]

    # Budgets with progress
    current_month = today.strftime("%Y-%m")
    budgets = await db.budgets.find(
        {"user_id": user["id"], "month": current_month}, {"_id": 0}
    ).to_list(200)
    budgets_with_progress = []
    for b in budgets:
        spent = category_totals.get(b["category"], 0.0)
        budgets_with_progress.append(
            {
                **b,
                "spent": round(spent, 2),
                "percent": round(min(spent / b["limit"] * 100.0, 999.0), 1)
                if b["limit"]
                else 0.0,
            }
        )

    # Upcoming bills (next 30 days)
    horizon = (today + timedelta(days=30)).isoformat()
    bills = (
        await db.bills.find(
            {
                "user_id": user["id"],
                "next_due_date": {"$lte": horizon},
            },
            {"_id": 0},
        )
        .sort("next_due_date", 1)
        .to_list(20)
    )

    # Goals
    goals = await db.goals.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)

    return {
        "base_currency": base_ccy,
        "kpis": {
            "income": round(month_income, 2),
            "expense": round(month_expense, 2),
            "net": round(net, 2),
            "savings_rate": round(savings_rate, 1),
        },
        "trend": trend,
        "category_breakdown": category_breakdown,
        "budgets": budgets_with_progress,
        "upcoming_bills": bills,
        "goals": goals,
    }
