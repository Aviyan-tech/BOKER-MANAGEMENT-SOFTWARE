# TerraFlow — Premium Land Brokerage Platform

A full-stack land brokerage application combining a public land marketplace, a real-estate CRM, interactive Kanban deal boards, real-time message rooms, and live negotiation deal rooms.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, TanStack Query
- **Backend**: FastAPI served with Uvicorn (Python 3.11+), SQLite / PostgreSQL via SQLAlchemy Async engine
- **Real-time**: WebSockets for messaging, active presence, views updates, and offer/counter negotiations
- **Authentication**: JWT Access/Refresh tokens with role claims (ADMIN, AGENT, CUSTOMER)

---

## Getting Started

### 1. Backend Setup
1. Open a terminal in `apps/backend/`.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations to create database schema:
   ```bash
   python -m alembic upgrade head
   ```
4. Seed the database with mock demo users (Admin, Agent, Customer) and listing parcels:
   ```bash
   python seed.py
   ```
5. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### 2. Frontend Setup
1. Open a terminal in `apps/web/`.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at: [http://localhost:3000](http://localhost:3000).

---

## Seeding Details (Demo Accounts)

Login with the following accounts to experience different role flows:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@terraflow.com` | `password` | Sees analytics, approves listings, sees all deals |
| **Agent** | `agent@terraflow.com` | `password` | Manages listings, moves deals through Kanban pipeline, direct messages, submits price offers |
| **Customer** | `customer@terraflow.com` | `password` | Browses listings, submits inquiries, participates in live negotiation |

---

## Folder Structure

```text
land-broker/
├── apps/
│   ├── web/                     # Next.js app (frontend)
│   │   ├── src/app/
│   │   │   ├── page.tsx         # Public browse marketplace
│   │   │   ├── login/, register/# Auth views
│   │   │   ├── dashboard/       # Client/Agent portals
│   │   │   └── admin/           # Admin panel
│   │   ├── src/components/      # UI components
│   │   └── src/context/         # AuthContext state manager
│   └── backend/                 # FastAPI service
│       ├── app/
│       │   ├── main.py          # FastAPI endpoints, socket handlers
│       │   ├── core/            # Config, deps, raw bcrypt security
│       │   ├── db/              # Session, base models
│       │   ├── models/          # SQLAlchemy schemas
│       │   └── routers/         # REST API routers
│       ├── alembic/             # Migrations
│       ├── seed.py              # Seeding database
│       └── requirements.txt     # Python requirements
├── docker-compose.yml           # Multi-container dev compose
└── README.md
```
