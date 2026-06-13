# ACIP — Advanced Company Intelligence Platform

An AI-powered Company Operating System: procurement, digital-twin inventory,
production, sales, finance, and an AI Business Brain — all in one PWA that
installs on your phone and runs in the browser on your laptop.

---

## ✅ Status: Tested & Database Live

- **Supabase database is LIVE** — project `lptvylstuhyoottrcyzr`, all 25
  tables created and subscription plans seeded.
- **Backend smoke-tested end to end** (locally against Postgres):
  - ✅ Startup registration & login (JWT auth)
  - ✅ Product creation
  - ✅ Purchase Requisition create + approve
  - ✅ Supplier creation
  - ✅ Digital Twin inventory registration (QR code generated)
  - ✅ Executive Dashboard (Business Health Score = 100 → drops on alerts)
  - ✅ AI Business Brain low-stock alert (auto-detected when stock fell
    below reorder level, severity "high")
- **Frontend builds cleanly** as an installable PWA (Vite + Tailwind).

**To go fully live, you only need to add 2 things to `backend/.env`:**
1. Your Supabase database password (Dashboard → Settings → Database)
2. Your Anthropic API key (for the AI chat / natural-language commands)

Everything else is ready to run.

---

## 0. What's already built

- **Database schema** (`backend/src/config/schema.sql`) — companies, users,
  products, digital-twin inventory, PR/PO, production, sales, finance,
  AI alerts, audit log, and subscription plans (Free / Monthly / Yearly).
- **Backend API** (Node/Express) — auth, procurement, inventory, production,
  sales, finance, AI Business Brain (Claude-powered), dashboard.
- **Frontend PWA** (React + Vite + Tailwind) — installable app with
  Login/Register, Dashboard (Business Health Score), AI chat, Digital Twin
  inventory, Orders, and Subscription pages.

---

## 1. Set up the database (Supabase)

1. Go to your Supabase project → **Settings → Database → Connection string**
   (use the "URI" / pooler connection string).
2. In `backend/.env` (copy from `.env.example`), paste it as `DATABASE_URL`
   and set `DB_SSL=true`.
3. Run the schema:
   ```bash
   cd backend
   npm install
   npm run migrate
   ```
   This creates every table and seeds the 3 subscription plans.

---

## 2. Configure the backend

1. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Fill in:
   - `DATABASE_URL` — from Supabase (step 1)
   - `JWT_SECRET` — any long random string
   - `ANTHROPIC_API_KEY` — your Claude API key (powers the AI Business Brain)

3. Run it locally to test:
   ```bash
   cd backend
   npm run dev
   ```
   Visit `http://localhost:4000/health` — should return `{"status":"ok"}`.

---

## 3. Configure the frontend

1. Create `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:4000/api
   ```
2. Run it:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open the printed `localhost` URL on your phone (same WiFi network, use
   your laptop's local IP instead of `localhost`) — your browser will offer
   "Add to Home Screen", making it a real app icon.

---

## 4. Try it out

1. **Register** as a Startup (just company name, founder, email, address).
2. Go to the **AI tab** and type: *"I need to buy 100 motors"*
   → it auto-creates a Purchase Requisition and suggests suppliers.
3. Go to **Orders** → approve the requisition → convert it to a PO
   (via API for now — see Section 6 for next steps).
4. Go to **Dashboard** to see your live Business Health Score.

---

## 5. Deploy (go live on phone + laptop)

**Backend → Railway or Render** (both support Node + env vars easily):
1. Push the `backend/` folder to a GitHub repo.
2. Create a new Web Service, point it at the repo, set the same env vars
   from your `.env`.
3. Note the deployed URL, e.g. `https://acip-backend.up.railway.app`.

**Frontend → Vercel** (connector already set up):
1. Push `frontend/` to GitHub (or the same repo, different root directory).
2. Import the project in Vercel, set root directory to `frontend`.
3. Add environment variable: `VITE_API_URL = https://acip-backend.up.railway.app/api`
4. Deploy — Vercel gives you a public URL (e.g. `acip.vercel.app`).
5. Open that URL on your phone → **Add to Home Screen**. Now ACIP is an app
   icon on your phone and a normal website on your laptop, same codebase.

---

## 6. What to build next (in order)

1. **Department & employee management UI** (SME/Enterprise registration is
   already in the API, needs a frontend admin page).
2. **PO creation UI** — currently PR→PO conversion happens via API; add a
   simple form in Orders.
3. **Inward entry + QR scanning** — use the phone camera to scan
   `qr_code` values and auto-fill inward entries.
4. **Production module UI** — work orders, consumption, finished goods.
5. **Payments** — wire Razorpay/Stripe into `/api/subscriptions/subscribe`
   and `/api/finance/invoices/:id/payments` before going live with billing.
6. **Multi-plant / multi-currency views** for Enterprise companies (schema
   already supports `country`/`currency` per company).

---

## Architecture summary

```
acip/
├── backend/                 Node + Express + PostgreSQL
│   └── src/
│       ├── config/          db connection, schema.sql, migration runner
│       ├── middleware/       auth (JWT), subscription gating
│       ├── routes/           auth, products, procurement, production,
│       │                      sales, finance, ai, subscriptions, dashboard
│       └── services/         auditService (digital history),
│                              aiService (Claude integration),
│                              alertEngine (hourly Business Brain checks)
└── frontend/                React + Vite + Tailwind (PWA)
    └── src/
        ├── pages/            Login, Register, Dashboard, AIAssistant,
        │                      Inventory, Orders, Subscription
        ├── context/           AuthContext
        └── services/          api.js (axios + JWT)
```
