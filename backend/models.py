"""Pydantic models for FinSight."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"]
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
    "Salary",
    "Freelance",
    "Investment",
    "Other",
]


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ------------------------------ User -----------------------------------------
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: Optional[str] = None
    base_currency: str = "USD"
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class UpdateSettings(BaseModel):
    name: Optional[str] = None
    base_currency: Optional[str] = None


# ------------------------------ Transaction ----------------------------------
TxType = Literal["expense", "income"]


class TransactionCreate(BaseModel):
    description: str
    amount: float = Field(gt=0)
    currency: str = "USD"
    category: Optional[str] = None  # optional: will auto-suggest if missing
    date: Optional[str] = None  # YYYY-MM-DD
    type: TxType = "expense"
    notes: Optional[str] = None
    merchant: Optional[str] = None


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    type: Optional[TxType] = None
    notes: Optional[str] = None
    merchant: Optional[str] = None


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    description: str
    amount: float
    currency: str = "USD"
    category: str = "Other"
    date: str  # YYYY-MM-DD
    type: TxType = "expense"
    notes: Optional[str] = None
    merchant: Optional[str] = None
    created_at: datetime = Field(default_factory=_now)


# ------------------------------ Budget ---------------------------------------
class BudgetCreate(BaseModel):
    category: str
    limit: float = Field(gt=0)
    month: str  # YYYY-MM


class BudgetUpdate(BaseModel):
    limit: Optional[float] = None


class Budget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    category: str
    limit: float
    month: str
    created_at: datetime = Field(default_factory=_now)


# ------------------------------ Recurring Bill --------------------------------
Frequency = Literal["weekly", "monthly", "yearly"]


class BillCreate(BaseModel):
    name: str
    amount: float = Field(gt=0)
    currency: str = "USD"
    frequency: Frequency = "monthly"
    next_due_date: str  # YYYY-MM-DD
    category: str = "Bills & Utilities"


class BillUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    frequency: Optional[Frequency] = None
    next_due_date: Optional[str] = None
    category: Optional[str] = None


class Bill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    name: str
    amount: float
    currency: str
    frequency: Frequency
    next_due_date: str
    category: str = "Bills & Utilities"
    created_at: datetime = Field(default_factory=_now)


# ------------------------------ Savings Goal ---------------------------------
class GoalCreate(BaseModel):
    name: str
    target_amount: float = Field(gt=0)
    current_amount: float = 0.0
    currency: str = "USD"
    target_date: Optional[str] = None  # YYYY-MM-DD


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    currency: Optional[str] = None
    target_date: Optional[str] = None


class GoalContribution(BaseModel):
    amount: float = Field(gt=0)


class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    name: str
    target_amount: float
    current_amount: float = 0.0
    currency: str = "USD"
    target_date: Optional[str] = None
    created_at: datetime = Field(default_factory=_now)


# ------------------------------ Receipt scan ---------------------------------
class ReceiptExtracted(BaseModel):
    merchant: str = ""
    total_amount: float = 0.0
    currency: str = "USD"
    date: str = ""
    category: str = "Other"
    items: List[dict] = Field(default_factory=list)


class CategorySuggestRequest(BaseModel):
    description: str
