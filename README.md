# 🛡️ Intelligent SIEM Analytics System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

An Intelligent Security Information and Event Management (SIEM) Analytics System for proactive threat detection, attack correlation, and incident prioritization.

---

## ✨ Key Features
1. **Real-time Event Ingestion & Processing** — Handle millions of security logs efficiently.
2. **AI-driven Threat Detection** — ML-powered anomaly classification (Random Forest, Decision Tree, Logistic Regression).
3. **Attack Chain Correlation** — Map disconnected alerts into actionable multi-stage attack storylines.
4. **Dynamic Risk Scoring** — Composite 0–100 risk scores based on ML confidence + rule severity + behavioral signals.
5. **Interactive SOC Dashboard** — Pitch-black cyberpunk UI with 3D particle background, glassmorphism, and Framer Motion animations.
6. **Automated Incident Response Recommendations** — Risk-based remediation actions (Monitor → Investigate → Escalate → Isolate).
7. **Compliance & Reporting** — ISO-27001/SOC2 violation tracking and audit log tables.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────┐
│          React Frontend (Vite)              │
│   SOC Dashboard • Charts • Attack Chains    │
│   Three.js Background • Framer Motion       │
└──────────────────┬──────────────────────────┘
                   │ REST API + WebSocket
┌──────────────────▼──────────────────────────┐
│          FastAPI Backend (Python)            │
│  Rule Engine │ ML Models │ Risk Scoring     │
│  Attack Correlator │ Recommendation Engine  │
│  JWT Auth │ Pydantic Validation             │
└──────────────────┬──────────────────────────┘
         ┌─────────┼─────────┐
    ┌────▼────┐ ┌──▼──┐ ┌───▼────┐
    │PostgreSQL│ │Redis│ │Models  │
    │ / SQLite │ │Cache│ │(.pkl)  │
    └─────────┘ └─────┘ └────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite, Tailwind CSS v3, Recharts, React Flow, Framer Motion, Three.js, Zustand |
| Backend | Python 3.10+, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| Database | PostgreSQL 15 (prod) / SQLite (dev), Redis |
| Auth | JWT (PyJWT) + bcrypt, role-based access control |
| Machine Learning | Scikit-learn, Pandas, NumPy, Joblib |
| Deployment | Docker, Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18 and **npm** (for frontend)
- **Python** ≥ 3.10 (for backend)
- *(Optional)* Docker & Docker Compose for containerized deployment
- *(Optional)* PostgreSQL 15 + Redis (backend defaults to SQLite for dev)

### Frontend Only (Standalone with Mock Data)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173 — works standalone with mock data
```

### Backend Only (SQLite Dev Mode — No Docker Needed)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# API docs at http://localhost:8000/docs
```

### Full Stack with Docker Compose
```bash
docker-compose up -d --build
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

---

## 📁 Project Structure

```text
SIEM/
├── docker-compose.yml          ← One-command startup
├── .env                        ← Environment variables
├── .gitignore
├── README.md
│
├── frontend/                   ← React 18 + Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js      ← Obsidian Gold & Emerald theme tokens
│   ├── index.html
│   └── src/
│       ├── main.jsx            ← React 18 root render
│       ├── App.jsx             ← React Router with 7 routes
│       ├── index.css           ← Global design system (CSS variables)
│       ├── store/
│       │   └── useSiemStore.js ← Zustand global state
│       ├── services/
│       │   └── api.js          ← Axios client with mock fallback
│       ├── components/
│       │   ├── canvas/CyberBackground.jsx  ← Three.js 3D particle spiral
│       │   ├── layout/Sidebar.jsx          ← Collapsible nav
│       │   ├── layout/Header.jsx           ← Top bar + live clock
│       │   ├── layout/AppShell.jsx         ← Route transition wrapper
│       │   └── LiveEventFeed.jsx           ← Real-time event ticker
│       ├── pages/
│       │   ├── Dashboard.jsx       ← Executive KPI overview
│       │   ├── EventExplorer.jsx   ← Searchable event table
│       │   ├── ThreatAnalytics.jsx ← Severity/type/IP charts
│       │   ├── AttackChains.jsx    ← React Flow graph visualizer
│       │   ├── MLPerformance.jsx   ← ML model comparison
│       │   ├── Recommendations.jsx ← Incident response cards
│       │   └── Compliance.jsx      ← Policy violation tracker
│       └── data/
│           └── mockData.js         ← 200 mock events + chains + ML metrics
│
├── backend/                    ← FastAPI (Python)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             ← FastAPI entry point + CORS + route registration
│   │   ├── config.py           ← Pydantic Settings (DB, JWT, Redis from .env)
│   │   ├── database.py         ← SQLAlchemy async engine + session (SQLite/PostgreSQL)
│   │   ├── models.py           ← ORM models (7 tables)
│   │   ├── schemas/            ← Pydantic v2 validation schemas
│   │   ├── auth.py             ← JWT create/verify + bcrypt + role-based deps
│   │   ├── routes/             ← API endpoints (auth, events, alerts, rules, threats, etc.)
│   │   └── services/           ← Detection, ML, risk scoring & correlation services
│   ├── data/
│   │   ├── seed_database.py    ← Multi-tenant evaluation database seeder
│   │   └── raw/                ← Telemetry datasets
│   ├── ml/                     ← Trained ML models (.pkl) & inference logic
│   └── tests/                  ← 77 automated unit & integration tests
│
├── traffic_sim.py              ← Live traffic & attack scenario generator for presentation demos
└── api/                        ← Vercel serverless entry point
```

---

## ⚡ Live Telemetry & Presentation Demo Setup

To run a live demonstration of threat ingestion, detection, and risk scoring:

```bash
# 1. Register a new user & organization (or login)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "username": "soc_admin",
        "password": "SecurePassword123!",
        "org_name": "SentriX Defense Lab",
        "org_slug": "sentrix-lab"
      }'

# 2. Run the Live Traffic Simulator
python traffic_sim.py --username soc_admin --password SecurePassword123! --speed 2
```

The traffic simulator continuously streams realistic event traffic (SSH brute force, port scans, data exfiltration bursts, privilege escalation) directly to the API. Watch the dashboard metrics, active alerts, and risk scores update live via WebSockets!

---

## 👥 Team Roles & Build Status

| Member | Role | Status |
|--------|------|--------|
| **Member 1** | Full-Stack Lead & Frontend Architect | ✅ Complete |
| **Member 2** | Backend Engineer & Database Architect | ✅ Complete |
| **Member 3** | ML Engineer & Data Scientist | ✅ Complete |
| **Member 4** | Security Logic & Detection Engineer | ✅ Complete |

### Member 4 — Security Logic Progress Tracker

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Rule-based detection engine (7 rules) | `app/services/rule_engine.py` | ✅ Done |
| 2 | Attack correlation engine | `app/services/attack_correlation.py` | ✅ Done |
| 3 | Compliance monitoring engine | `app/services/compliance.py` | ✅ Done |
| 4 | Incident recommendation engine | `app/services/recommendations.py` | ✅ Done |
| 5 | Attack chain API routes | `app/routes/chain_routes.py` | ✅ Done |
| 6 | Compliance API routes | `app/routes/compliance_routes.py` | ✅ Done |
| 7 | Recommendation API routes | `app/routes/recommendation_routes.py` | ✅ Done |
| 8 | Detection rule unit tests | `tests/test_rules.py` | ✅ Done (10/10 Passed) |

### Member 3 — ML Progress Tracker

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Feature engineering module | `ml/feature_engineering.py` | ✅ Done |
| 2 | Model training pipeline | `ml/train_models.py` | ✅ Done |
| 3 | Model serialization (.pkl) | `ml/models/*.pkl` | ✅ Done |
| 4 | ML service layer | `app/services/ml_service.py` | ✅ Done |
| 5 | Composite risk scoring algorithm | `app/services/risk_scoring.py` | ✅ Done |
| 6 | ML API routes | `app/routes/ml_routes.py` | ✅ Done |
| 7 | Risk API routes | `app/routes/risk_routes.py` | ✅ Done |
| 8 | ML unit tests | `tests/test_ml.py` | ✅ Done (8/8 Passed) |

### Member 2 — Backend Progress Tracker

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | App config (Pydantic Settings) | `app/config.py` | ✅ Done |
| 2 | Database engine + session | `app/database.py` | ✅ Done |
| 3 | ORM models (7 tables) | `app/models.py` | ✅ Done |
| 4 | Pydantic schemas | `app/schemas.py` | ✅ Done |
| 5 | JWT auth utilities | `app/auth.py` | ✅ Done |
| 6 | Auth routes (login/register) | `routes/auth_routes.py` | ✅ Done |
| 7 | Event CRUD routes | `routes/event_routes.py` | ✅ Done |
| 8 | Threat analytics routes | `routes/threat_routes.py` | ✅ Done |
| 9 | WebSocket server | `routes/websocket.py` | ✅ Done |
| 10 | Synthetic data generator | `data/generate_synthetic.py` | ✅ Done (10K events) |
| 11 | Database seeder | `data/seed_database.py` | ✅ Done (Seeded) |
| 12 | Update main.py (register routes) | `app/main.py` | ✅ Done |
| 13 | API tests | `tests/test_api.py` | ✅ Done (16/16 Passed) |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Owner |
|--------|----------|-------------|-------|
| GET | `/` | API info | M2 |
| GET | `/health` | Health check | M2 |
| POST | `/api/auth/register` | Create user account | M2 |
| POST | `/api/auth/login` | JWT login → token | M2 |
| GET | `/api/events` | List events (paginated, filterable) | M2 |
| GET | `/api/events/stats` | Aggregate severity counts | M2 |
| GET | `/api/events/{id}` | Single event detail | M2 |
| GET | `/api/threats/by-severity` | Severity distribution | M2 |
| GET | `/api/threats/by-type` | Attack type breakdown | M2 |
| GET | `/api/threats/top-ips` | Top 10 attacking IPs | M2 |
| GET | `/api/threats/timeline` | Events grouped by date | M2 |
| WS | `/ws/events` | Real-time event stream | M2 |
| POST | `/api/ml/predict` | ML prediction on event | M3 |
| GET | `/api/ml/performance` | Model comparison metrics | M3 |
| GET | `/api/ml/feature-importance` | Feature importance data | M3 |
| GET | `/api/risk-scores` | Scored incidents list | M3 |
| GET | `/api/attack-chains` | Detected attack chains | M4 |
| GET | `/api/attack-chains/{id}` | Chain with stages | M4 |
| GET | `/api/compliance/violations` | Compliance violations | M4 |
| GET | `/api/compliance/summary` | Compliance summary | M4 |
| GET | `/api/recommendations` | Incident recommendations | M4 |

---

## 🐛 Debugging Guide

### Frontend Issues
- **Mock mode**: Set `USE_MOCK = true` in `frontend/src/services/api.js` to run without backend.
- **Build errors**: Run `npm run build` — check for missing imports or syntax errors.
- **Blank page**: Check browser console (F12) for JS errors. Hard refresh with `Ctrl+F5`.
- **Blue background still showing**: Clear browser cache completely or use incognito mode.

### Backend Issues
- **SQLite mode**: `database.py` defaults to `USE_SQLITE = True` — no PostgreSQL needed for dev.
- **Import errors**: Ensure you're in the `backend/` directory and virtual env is activated.
- **JWT errors**: Check `.env` has `JWT_SECRET` set. Token expires after `JWT_EXPIRY_MINUTES`.
- **Database not found**: Run the app once — `init_db()` in `main.py` auto-creates tables.

### Common Git Issues
- **Before pulling**: Always `git stash` your local changes first.
- **Merge conflicts**: Each member works in separate directories (`frontend/`, `backend/app/routes/`, etc.).
- **After pulling**: Run `npm install` (frontend) and `pip install -r requirements.txt` (backend).

---
## Multi-Tenant Security & Authentication Architecture (Sprint 9)

SentriX implements a strict **Multi-Tenant Foundation** with tenant isolation, organization memberships, and role-based access control (RBAC).

### Key Authentication Features
- **Organization Registration** – `POST /api/auth/register` atomically creates a new `Organization`, a `User`, and an `OrganizationMembership` with the `owner` (admin) role.
- **JWT Tenant Context** – JWT access tokens include `sub` (username), `user_id`, `org_id`, `role`, and `exp`.
- **Tenant Data Isolation** – All database queries for events, alerts, rules, attack chains, and compliance violations are scoped by `org_id`.
- **WebSocket Isolation** – Real-time event streams validate JWT claims and stream logs scoped strictly to the authenticated organization.

### Organization Onboarding Example
```bash
# 1. Register Organization & Admin Account
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "username": "upes_admin",
        "password": "SecurePassword123!",
        "org_name": "UPES Security Lab",
        "org_slug": "upes-security-lab"
      }'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"upes_admin","password":"SecurePassword123!"}'
```
The response returns `{ access_token, token_type: "bearer", username, role }`.

### Protected REST Endpoints
| Method | Endpoint | Required Role |
|--------|----------|---------------|
| GET | `/api/events` | analyst, manager, admin |
| POST | `/api/events` | analyst, admin |
| POST `/api/auth/register` | admin |
| ... | ... | ... |

### WebSocket Authentication
- Connect to `ws://localhost:8000/ws/events?token=<JWT>` or send `Authorization: Bearer <JWT>` header.
- Server validates the token before accepting the connection.

### Environment Variables (authentication)
- `JWT_SECRET` – secret key for signing tokens.
- `JWT_ALGORITHM` – default `HS256`.
- `JWT_EXPIRY_MINUTES` – token lifetime.
- `USE_SQLITE` – toggle DB backend (default true for dev).

### Updated Project Structure
```
backend/
├─ app/
│  ├─ auth.py           # JWT utilities & role deps
│  ├─ routes/
│  │  ├─ auth_routes.py
│  │  └─ websocket.py
│  └─ tests/
│     ├─ auth_fixtures.py   # new authentication fixtures
│     └─ test_protected.py   # protected & WebSocket tests
```

*All documentation for authentication, architecture, API, testing and security is available under `backend/docs/`.*

---

## 📄 License
Educational — IBM SkillsBuild Program


## Sprint 3 (SOC Operations) Additions

- **Detection Rules Engine**: A dynamic, JSON-based execution engine that evaluates incoming SecurityEvent payloads in real-time.
- **Rule Simulation Engine**: /api/rules/test endpoint to safely sandbox and dry-run rule logic without database persistence.
- **Execution Analytics**: Immutable audit logging and performance metrics (match rates, execution times) for all rule evaluations.
- **Alert Lifecycle**: Full state-machine management (New, Investigating, Closed) with assignment and auditing capabilities.
- **Domain-Driven Restructure**: Refactored monolithic ORM models and Pydantic schemas into scalable domain packages.
