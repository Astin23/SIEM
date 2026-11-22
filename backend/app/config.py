"""
SIEM Analytics System - Application Configuration
Uses Pydantic Settings to load environment variables from .env file.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
import logging

logger = logging.getLogger("siem.config")


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Mode Toggle (True = SQLite for dev/Vercel, False = PostgreSQL)
    USE_SQLITE: bool = True

    # PostgreSQL Database
    POSTGRES_USER: str = "siem_admin"
    POSTGRES_PASSWORD: str = "siem_secure_2024"
    POSTGRES_DB: str = "siem_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Authentication Security Settings
    # Default placeholder key for development only. MUST be overridden in production via JWT_SECRET env var.
    JWT_SECRET: str = "change-me-to-a-strong-random-secret-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 480

    # Backend Server & Environment
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def DATABASE_URL(self) -> str:
        """Async PostgreSQL connection string for SQLAlchemy."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
        """Sync PostgreSQL connection string (for Alembic migrations)."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SQLITE_URL(self) -> str:
        """SQLite fallback for development without PostgreSQL."""
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "siem.db")
        return f"sqlite+aiosqlite:///{db_path}"

    model_config = {
        "env_file": os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton. Call this to access configuration."""
    s = Settings()
    default_secrets = {
        "your-super-secret-jwt-key-change-in-production",
        "change-me-to-a-strong-random-secret-in-production-min-32-chars",
    }
    if s.JWT_SECRET in default_secrets:
        if not s.DEBUG:
            logger.critical(
                "[SECURITY ALERT] Default JWT_SECRET detected in PRODUCTION mode! "
                "Set a secure JWT_SECRET environment variable immediately."
            )
        else:
            logger.warning(
                "[SECURITY WARN] Using default development JWT_SECRET. "
                "Ensure JWT_SECRET is set in environment for production."
            )
    return s


