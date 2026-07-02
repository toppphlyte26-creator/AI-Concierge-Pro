# FinSight PRD (Product Requirements)

## Product
FinSight — AI-powered personal finance tracker (dark fintech UI).

## Live Preview
https://critique-central-2.preview.emergentagent.com/

## Tech
- Backend: FastAPI (async), MongoDB (motor), python-jose (JWT), bcrypt, Pillow
- Frontend: React 19, Tailwind, shadcn/ui, Recharts, Framer Motion, sonner, react-router v7
- AI: Gemini 2.5 Flash via Emergent Universal LLM Key (emergentintegrations)

## Features (V1 shipped)
- Email/password JWT auth (register, login, /me, update profile)
- New users get seeded sample data: 30–40 transactions, 5 budgets, 5 bills, 3 goals
- Transactions: CRUD, filters (category, currency, type), AI auto-category on empty
- Receipt Scan: upload image → Gemini vision → structured JSON (merchant, total, currency, date, category, items) → save as transaction
- Budgets: monthly caps per category with progress bars + over-budget UI
- Recurring Bills: name, amount, currency, frequency (weekly/monthly/yearly), next_due_date, category
- Savings Goals: target/current amounts, target date, contributions
- Multi-currency: USD/EUR/GBP/INR/JPY; base currency set per user; dashboard aggregates converted via static rates
- Dashboard: KPI cards (Income, Expense, Net, Savings Rate) + category donut + 6-month trend + budgets progress + upcoming bills + goals progress
- Settings: profile name + base currency; logout

## Endpoints (all under /api)
- `POST /auth/signup`, `POST /auth/login`, `GET/PATCH /auth/me`
- `GET/POST/PATCH/DELETE /transactions[/:id]`
- `POST /ai/categorize` (Gemini)
- `POST /receipts/scan` (multipart, Gemini vision)
- `GET/POST/PATCH/DELETE /budgets[/:id]`
- `GET/POST/PATCH/DELETE /bills[/:id]`
- `GET/POST/PATCH/DELETE /goals[/:id]` + `POST /goals/:id/contribute`
- `GET /dashboard`
- `GET /meta/categories`

## Testing
- Phase 1 POC: `/app/test_core.py` — Gemini text + vision passed.
- Phase 2 E2E: `testing_agent_v3` iteration_2 → 42/42 passed (28 backend + 14 frontend).

## Notes / Testing Backdoors
- Signup is open. To pre-seed a stable demo account for manual testing, sign up with any new email; sample data is created automatically.
- Change base currency in Settings; dashboard aggregations reflect it immediately.
