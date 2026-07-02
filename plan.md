# FinSight (AI Finance) — Development Plan

## 1. Objectives
- Deliver a working MVP personal finance tracker on FARM (FastAPI + React + MongoDB) with a **modern fintech dark UI**.
- Prove the **core AI workflow** is reliable before building the full app:
  - Receipt image → Gemini 2.5 Flash → structured JSON extraction.
  - Text description → Gemini 2.5 Flash → category suggestion.
- Build V1 around: transactions, budgets, recurring bills, savings goals, multi-currency (static FX), dashboard.
- Add **email/password JWT auth** + seed data (20–30 txns, budgets, bills, goals) per new user.

## 2. Implementation Steps

### Phase 1 — Core POC (AI receipt + categorization) *Must pass before Phase 2*
**Goal:** Validate Gemini vision + structured output with real input.
1. Websearch: best practices for Gemini 2.5 Flash multimodal + JSON schema prompting (structured outputs, retries, safety).
2. Implement `/app/test_core.py` (standalone) using `emergentintegrations`:
   - Test 1: text categorization: `{"description":"Starbucks coffee downtown","currency":"USD"}` → category from allowed list.
   - Test 2: vision extraction from a **public receipt image URL** → JSON:
     - `merchant`, `total_amount`, `currency`, `date`, `category`, `items[]` (name, qty, price optional).
   - Add validation: JSON parse, required fields present, graceful fallback (`unknown`) if missing.
3. Iterate prompts + parsing until both tests succeed consistently.
4. Output: finalized prompt templates + parsing helpers to copy into backend `ai_service.py`.

**User stories (Phase 1)**
1. As a developer, I can run `python /app/test_core.py` and see a green pass for text categorization.
2. As a developer, I can run `python /app/test_core.py` and get valid JSON from a receipt image.
3. As a developer, I can detect missing fields and see defaults applied without crashing.
4. As a developer, I can swap receipt images and still get structured output.
5. As a developer, I can reuse the same prompt/parsing logic in the API without changes.

---

### Phase 2 — V1 App Development (MVP without auth first, then 1 E2E test)
**Goal:** Build the product UI + core data flows using proven AI helpers.
1. Backend foundation (minimal modules):
   - `db.py` motor client; `models.py` core Pydantic schemas.
   - `currency.py` static rates (USD/EUR/GBP/INR/JPY) + conversion helpers.
   - `ai_service.py` using the *Phase 1 proven* prompts for:
     - `suggest_category(description)`
     - `extract_receipt(image_bytes|url)`
   - Routes (no auth yet): `transactions`, `receipt`, `dashboard`.
2. Frontend V1 pages (no auth yet):
   - Layout: `Sidebar` + `Topbar` + dark theme.
   - `Dashboard`: KPI cards + donut (spend by category) + 6-month trend + budget progress + upcoming bills + goals.
   - `Transactions`: list + filters + add/edit modal (AI category suggestion when category empty).
   - `ReceiptScan`: upload → preview extracted fields → save as transaction.
3. Ensure file upload works (multipart) and receipt image is displayed/previewed.
4. Call `testing_agent_v3` for Phase 2 E2E (dashboard loads, create txn, receipt scan flow, charts render).

**User stories (Phase 2)**
1. As a user, I can add an expense and see it immediately reflected on the dashboard KPIs.
2. As a user, I can leave category blank and get an AI-suggested category I can accept/edit.
3. As a user, I can upload a receipt image and review extracted merchant/amount/date/currency before saving.
4. As a user, I can filter transactions by date range and category to find specific spending.
5. As a user, I can view spending-by-category and income-vs-expense trends in a clear dark-mode dashboard.

---

### Phase 3 — Add Auth + Seed Data + Remaining Features, then 1 E2E test
**Goal:** Make it multi-user, secure, and “alive” immediately after signup.
1. Auth:
   - `auth.py` (bcrypt hashing, JWT create/verify, `get_current_user`).
   - Routes: `/auth/signup`, `/auth/login`, `/auth/me`.
   - Add a **demo account** (document creds in code comments / seed) for testing.
2. Data model expansion + routes (JWT-protected):
   - Categories: predefined + custom per user.
   - Budgets (monthly per category) + progress endpoints.
   - Recurring bills: frequency + next due date; endpoint to list upcoming.
   - Savings goals: target/current/target date.
   - User profile: base currency.
3. Seed on signup (`seed.py`):
   - 20–30 txns across currencies + 2–3 budgets + 1–2 bills + 1–2 goals.
4. Frontend auth wiring:
   - `AuthContext` + protected routes + axios interceptor.
   - Pages: `Landing`, `Login`, `Signup`, `Settings` (base currency, categories).
5. Call `testing_agent_v3` for Phase 3 E2E (signup/login, seeded dashboard, CRUD flows, receipt upload under auth).

**User stories (Phase 3)**
1. As a new user, I can sign up and instantly see a populated dashboard with realistic sample data.
2. As a returning user, I can log in and only see my own transactions/budgets/bills/goals.
3. As a user, I can change my base currency and see dashboard totals converted consistently.
4. As a user, I can create a monthly budget and see a progress bar update as I add expenses.
5. As a user, I can add recurring bills and see upcoming due dates on the dashboard.

---

### Phase 4 — Polish, Hardening, and UX Improvements (then 1 E2E test)
1. Robustness:
   - AI retry/backoff, response validation, and safe fallbacks.
   - Better error states for upload/parse failures.
2. UX:
   - Empty states, skeleton loaders, toasts, optimistic updates.
   - Editing flows for extracted receipt fields.
3. Performance/quality:
   - Indexes in Mongo for user_id + date.
   - Pagination for transactions list.
4. Final `testing_agent_v3` pass and fix all priority issues.

**User stories (Phase 4)**
1. As a user, if receipt parsing fails, I get a clear error and can still enter the transaction manually.
2. As a user, I can edit/delete any record and the UI updates without a full refresh.
3. As a user, I can browse large transaction histories with pagination and fast filters.
4. As a user, I can trust totals because conversion and rounding are consistent everywhere.
5. As a user, I can use the app smoothly on mobile with a responsive sidebar/layout.

## 3. Next Actions (Immediate)
1. Run websearch for Gemini 2.5 Flash multimodal structured JSON best practices.
2. Create `/app/test_core.py` and complete Phase 1 until both tests pass.
3. Only then start Phase 2 MVP build (backend + frontend) around proven prompts/parsers.

## 4. Success Criteria
- Phase 1: `test_core.py` consistently returns valid JSON for receipt extraction + category suggestion.
- Phase 2: V1 app supports transactions + receipt scan + dashboard visuals; **testing_agent_v3 confirms E2E pass**.
- Phase 3: JWT auth works; new user gets seeded data; multi-currency conversion works for aggregates; **testing_agent_v3 confirms E2E pass**.
- Phase 4: Error handling, pagination, and UX polish complete; **testing_agent_v3 confirms final E2E pass**.
