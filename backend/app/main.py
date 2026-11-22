"""SIEM Analytics System - FastAPI Backend Server

This is the main entry point for the backend API.
Registers all route modules and initializes the database on startup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os
import logging

# Ensure backend root is in sys.path when imported as backend.app.main:app
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import init_db
from app.services.ml_service import load_models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("siem")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: runs on startup and shutdown."""
    logger.info("SIEM Analytics API starting up...")
    await init_db()
    logger.info("[OK] Database tables verified/created")
    load_models()
    logger.info("[OK] ML models loaded into memory")
    logger.info("[OK] API ready at http://0.0.0.0:8000/docs")
    yield
    logger.info("SIEM Analytics API shutting down...")


app = FastAPI(
    title="SIEM Analytics API",
    description="Intelligent SIEM Analytics System for Threat Detection, Attack Correlation and Incident Prioritization",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Configuration (Restricted HTTP Methods & Headers) ────────────────
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)


# ── HTTP Security Response Headers Middleware ─────────────────────────────
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    return response


# ── Health & Info ────────────────────────────────────────

@app.get("/", tags=["System"])
async def root():
    return {
        "name": "SIEM Analytics API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy"}


# ── Register Route Modules ──────────────────────────────

# Member 2: Auth, Events, Threats, WebSocket, Alerts
from app.routes import auth_routes, event_routes, threat_routes, websocket, alert_routes, rule_routes

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(event_routes.router, prefix="/api/events", tags=["Events"])
app.include_router(alert_routes.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(rule_routes.router, prefix="/api/rules", tags=["Detection Rules"])
app.include_router(threat_routes.router, prefix="/api/threats", tags=["Threats"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


# Member 3: ML Models & Risk Scores
from app.routes import ml_routes, risk_routes
app.include_router(ml_routes.router, prefix="/api/ml", tags=["ML Models"])
app.include_router(risk_routes.router, prefix="/api/risk-scores", tags=["Risk Scores"])

# Member 4: Security Logic & Attack Chains
from app.routes import chain_routes, compliance_routes, recommendation_routes
app.include_router(chain_routes.router, prefix="/api/attack-chains", tags=["Attack Chains"])
app.include_router(compliance_routes.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(recommendation_routes.router, prefix="/api/recommendations", tags=["Recommendations"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
