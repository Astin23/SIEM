"""
SIEM Analytics System - Multi-Tenant Evaluation Database Seeder

Populates an isolated evaluation tenant with synthetic SIEM telemetry for demonstration.

MANUAL EXECUTION ONLY:
    cd backend
    python -m data.seed_database [--org-slug <slug>] [--org-name <name>] [--username <user>] [--password <pass>]

    Optional Environment Overrides:
    DEMO_ORG_NAME="UPES Cyber Security Lab"
    DEMO_ORG_SLUG="upes-cyber-security-lab"
    DEMO_USERNAME="demo_admin"
    DEMO_PASSWORD="demo123"
"""
import csv
import json
import os
import sys
import argparse
import asyncio
import logging
from datetime import datetime

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.database import engine, async_session, Base
import app.models  # Ensure all models are registered
from app.models import (
    User, Organization, OrganizationMembership,
    SecurityEvent, AttackChain, AttackChainStage,
    ComplianceViolation, MLModelMetric
)
from app.auth import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("siem.seeder")

DATA_DIR = os.path.join(os.path.dirname(__file__), "raw")
EVENTS_CSV = os.path.join(DATA_DIR, "security_events.csv")
CHAINS_JSON = os.path.join(DATA_DIR, "attack_chains.json")


def parse_bool(val: str) -> bool:
    return str(val).strip().lower() in ("true", "1", "yes")


def parse_int(val: str, default: int = 0) -> int:
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def parse_float(val: str, default: float = 0.0) -> float:
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def parse_datetime(val: str) -> datetime | None:
    if not val or not val.strip():
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(val.strip(), fmt)
        except ValueError:
            continue
    return None


async def seed_events(session, org_id: int, max_events: int = 300):
    if not os.path.exists(EVENTS_CSV):
        logger.info(f"[INFO] Events CSV not found at {EVENTS_CSV}. Generating synthetic events programmatically...")
        import random
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        event_types = ["failed_login", "ssh_brute_force", "unauthorized_access", "port_scan", "privilege_escalation", "data_exfiltration"]
        usernames = ["admin", "root", "jdoe", "asmith", "system_service", "db_user"]
        sources = ["192.168.1.105", "10.0.4.12", "45.33.32.156", "185.220.101.5", "192.168.1.200"]
        severities = ["Critical", "High", "Medium", "Low"]
        batch = []
        for i in range(max_events):
            sev = random.choice(severities)
            e_type = random.choice(event_types)
            evt = SecurityEvent(
                org_id=org_id,
                timestamp=now - timedelta(minutes=random.randint(1, 1440)),
                source_ip=random.choice(sources),
                destination_ip="10.0.0.1",
                username=random.choice(usernames),
                event_type=e_type,
                login_status="failed" if "login" in e_type or "brute" in e_type else "success",
                failed_attempts=random.randint(3, 15) if "brute" in e_type else 1,
                destination_port=22 if "ssh" in e_type else 443,
                protocol="TCP",
                bytes_transferred=random.randint(500, 50000),
                device_type="Server",
                country="US",
                alert_type="Authentication Anomaly" if "login" in e_type else "Threat Detected",
                severity=sev,
                label="Anomaly" if sev in ("Critical", "High") else "Normal",
                risk_score=85.0 if sev == "Critical" else (65.0 if sev == "High" else 30.0),
                ml_prediction="anomaly" if sev in ("Critical", "High") else "normal",
                ml_confidence=0.92,
                rule_triggered="SSH Brute Force Detection" if "brute" in e_type else "Anomaly Rule",
                recommendation="Isolate source IP" if sev == "Critical" else "Monitor user",
                escalation=sev == "Critical",
            )
            batch.append(evt)
        session.add_all(batch)
        await session.flush()
        logger.info(f"[OK] Programmatically seeded {len(batch)} security events for org_id={org_id}")
        return len(batch)

    count = 0
    with open(EVENTS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        batch = []

        for row in reader:
            if max_events > 0 and count >= max_events:
                break
            event = SecurityEvent(
                org_id=org_id,
                timestamp=parse_datetime(row.get("timestamp", "")),
                source_ip=row.get("source_ip", "0.0.0.0"),
                destination_ip=row.get("destination_ip", ""),
                username=row.get("username", ""),
                event_type=row.get("event_type", "unknown"),
                login_status=row.get("login_status", ""),
                failed_attempts=parse_int(row.get("failed_attempts", "0")),
                destination_port=parse_int(row.get("destination_port", "0")),
                protocol=row.get("protocol", ""),
                bytes_transferred=parse_int(row.get("bytes_transferred", "0")),
                device_type=row.get("device_type", ""),
                country=row.get("country", ""),
                alert_type=row.get("alert_type", ""),
                severity=row.get("severity", "Low"),
                label=row.get("label", "Normal"),
                risk_score=parse_float(row.get("risk_score", "0")),
                ml_prediction=row.get("ml_prediction", "normal"),
                ml_confidence=parse_float(row.get("ml_confidence", "0")),
                rule_triggered=row.get("rule_triggered", ""),
                recommendation=row.get("recommendation", ""),
                escalation=parse_bool(row.get("escalation", "False")),
            )
            batch.append(event)
            count += 1

            if len(batch) >= 500:
                session.add_all(batch)
                await session.flush()
                batch = []

        if batch:
            session.add_all(batch)
            await session.flush()

    logger.info(f"[OK] Seeded {count} security events for org_id={org_id}")
    return count


async def seed_attack_chains(session, org_id: int):
    if not os.path.exists(CHAINS_JSON):
        logger.info(f"[INFO] Attack chains JSON not found at {CHAINS_JSON}. Generating synthetic attack chains programmatically...")
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        default_chains = [
            {
                "name": "Ransomware Delivery Sequence",
                "source_ip": "45.33.32.156",
                "target_system": "10.0.1.15",
                "username": "admin",
                "start_time": now - timedelta(hours=3),
                "end_time": now,
                "severity": "Critical",
                "risk_score": 95.0,
                "status": "active"
            },
            {
                "name": "SSH Brute Force to Privilege Escalation",
                "source_ip": "185.220.101.5",
                "target_system": "10.0.1.50",
                "username": "root",
                "start_time": now - timedelta(hours=5),
                "end_time": now - timedelta(hours=1),
                "severity": "High",
                "risk_score": 82.0,
                "status": "active"
            },
            {
                "name": "Database Exfiltration Attempt",
                "source_ip": "192.168.1.105",
                "target_system": "10.0.2.10",
                "username": "db_user",
                "start_time": now - timedelta(hours=12),
                "end_time": now - timedelta(hours=8),
                "severity": "Critical",
                "risk_score": 88.0,
                "status": "investigating"
            }
        ]
        count = 0
        for chain_data in default_chains:
            chain = AttackChain(
                org_id=org_id,
                name=chain_data["name"],
                source_ip=chain_data["source_ip"],
                target_system=chain_data["target_system"],
                username=chain_data["username"],
                start_time=chain_data["start_time"],
                end_time=chain_data["end_time"],
                severity=chain_data["severity"],
                risk_score=chain_data["risk_score"],
                status=chain_data["status"],
            )
            session.add(chain)
            count += 1
        await session.flush()
        logger.info(f"[OK] Programmatically seeded {count} attack chains for org_id={org_id}")
        return count

    with open(CHAINS_JSON, "r", encoding="utf-8") as f:
        chains_data = json.load(f)

    count = 0
    for chain_data in chains_data:
        chain = AttackChain(
            org_id=org_id,
            name=chain_data["name"],
            source_ip=chain_data["source_ip"],
            target_system=chain_data["target_system"],
            username=chain_data["username"],
            start_time=parse_datetime(chain_data["start_time"]),
            end_time=parse_datetime(chain_data["end_time"]),
            severity=chain_data["severity"],
            risk_score=chain_data["risk_score"],
            status=chain_data.get("status", "active"),
        )
        session.add(chain)
        await session.flush()

        for stage_data in chain_data.get("stages", []):
            stage = AttackChainStage(
                org_id=org_id,
                chain_id=chain.id,
                stage_number=stage_data["stage_number"],
                attack_type=stage_data["attack_type"],
                timestamp=parse_datetime(stage_data["timestamp"]),
                description=stage_data["description"],
                severity=stage_data["severity"],
            )
            session.add(stage)

        count += 1

    await session.flush()
    logger.info(f"[OK] Seeded {count} attack chains for org_id={org_id}")
    return count


async def seed_compliance_violations(session, org_id: int):
    import random
    from datetime import timedelta, timezone

    violations = [
        ("After-Hours Access", "john.doe", "10.0.1.15", "Login at 23:45 outside business hours", "ISO-27001 A.9", "Medium"),
        ("Unauthorized Access", "svc_backup", "10.0.5.23", "Service account accessed admin console", "SOC2 CC6.1", "High"),
        ("Unencrypted Transfer", "alex.kumar", "192.168.1.25", "500MB transferred over FTP (unencrypted)", "PCI-DSS 4.1", "High"),
        ("Failed Auth Threshold", "45.33.32.156", "45.33.32.156", "52 failed login attempts in 10 minutes", "ISO-27001 A.9.4", "Critical"),
        ("Password Policy", "mike.wilson", "10.0.2.88", "Password unchanged for 120+ days", "SOC2 CC6.1", "Low"),
    ]

    base_time = datetime.now(timezone.utc)
    for vtype, user, ip, desc, policy, sev in violations:
        v = ComplianceViolation(
            org_id=org_id,
            timestamp=base_time - timedelta(days=random.randint(0, 15), hours=random.randint(0, 23)),
            violation_type=vtype,
            username=user,
            source_ip=ip,
            description=desc,
            policy=policy,
            severity=sev,
            status=random.choice(["open", "investigating", "resolved"]),
        )
        session.add(v)

    await session.flush()
    logger.info(f"[OK] Seeded {len(violations)} compliance violations for org_id={org_id}")
    return len(violations)


async def seed_ml_metrics(session):
    result = await session.execute(select(MLModelMetric))
    if result.scalars().first():
        return 0

    models = [
        MLModelMetric(model_name="Random Forest Anomaly Detector", accuracy=0.943, precision_score=0.921, recall=0.967, f1_score=0.944, is_active=True),
        MLModelMetric(model_name="Decision Tree Classifier", accuracy=0.882, precision_score=0.854, recall=0.901, f1_score=0.877, is_active=False),
        MLModelMetric(model_name="Logistic Regression", accuracy=0.824, precision_score=0.798, recall=0.841, f1_score=0.819, is_active=False),
    ]
    session.add_all(models)
    await session.flush()
    logger.info(f"[OK] Seeded {len(models)} ML model metrics")
    return len(models)


async def get_or_create_demo_tenant(session, org_slug: str, org_name: str, username: str, password: str):
    # 1. Organization
    org_res = await session.execute(select(Organization).where(Organization.slug == org_slug))
    org = org_res.scalars().first()
    if not org:
        org = Organization(name=org_name, slug=org_slug)
        session.add(org)
        await session.flush()
        logger.info(f"[OK] Created Organization: '{org_name}' (slug='{org_slug}', id={org.id})")
    else:
        logger.info(f"[INFO] Using existing Organization: '{org.name}' (id={org.id})")

    # 2. User
    user_res = await session.execute(select(User).where(User.username == username))
    user = user_res.scalars().first()
    if not user:
        user = User(username=username, password_hash=hash_password(password), role="admin")
        session.add(user)
        await session.flush()
        logger.info(f"[OK] Created Admin User: '{username}' (id={user.id})")
    else:
        logger.info(f"[INFO] Using existing User: '{user.username}' (id={user.id})")

    # 3. Membership (First user role is admin)
    mem_res = await session.execute(
        select(OrganizationMembership)
        .where(OrganizationMembership.user_id == user.id)
        .where(OrganizationMembership.org_id == org.id)
    )
    membership = mem_res.scalars().first()
    if not membership:
        membership = OrganizationMembership(user_id=user.id, org_id=org.id, role="admin")
        session.add(membership)
        await session.flush()
        logger.info(f"[OK] Added Membership: User '{username}' -> Org '{org.name}' (role=admin)")

    return org, username, password


async def seed_demo_tenant_if_needed(
    org_slug: str = "demo-soc",
    org_name: str = "SentriX Demo SOC",
    username: str = "demo_admin",
    password: str = "demo123",
    events: int = 300
):
    """Ensures the evaluation demo tenant and dataset exist on application startup."""
    if os.getenv("TESTING"):
        return

    try:
        async with async_session() as session:
            user_res = await session.execute(select(User).where(User.username == username))
            if user_res.scalars().first():
                return  # Demo account already exists

            async with session.begin():
                org, u_name, p_word = await get_or_create_demo_tenant(session, org_slug, org_name, username, password)
                await seed_events(session, org.id, events)
                await seed_attack_chains(session, org.id)
                await seed_compliance_violations(session, org.id)
                await seed_ml_metrics(session)
            await session.commit()
            logger.info(f"[OK] Auto-seeded evaluation demo tenant '{org_name}' (username='{username}') for deployment readiness.")
    except Exception as e:
        logger.warning(f"[WARN] Automatic demo tenant seeding skipped/failed: {e}")


async def main():
    if os.getenv("TESTING"):
        raise RuntimeError("Refusing to seed database while TESTING environment variable is set!")

    parser = argparse.ArgumentParser(description="SentriX Multi-Tenant Evaluation Database Seeder")
    parser.add_argument("--org-slug", default=os.getenv("DEMO_ORG_SLUG", "demo-soc"), help="Organization slug to seed")
    parser.add_argument("--org-name", default=os.getenv("DEMO_ORG_NAME", "SentriX Demo SOC"), help="Organization display name")
    parser.add_argument("--username", default=os.getenv("DEMO_USERNAME", "demo_admin"), help="Admin username")
    parser.add_argument("--password", default=os.getenv("DEMO_PASSWORD", "demo123"), help="Admin password")
    parser.add_argument("--events", type=int, default=300, help="Maximum number of security events to seed (default: 300)")
    args = parser.parse_args()

    logger.info("SentriX Multi-Tenant Evaluation Database Seeder")
    logger.info("=" * 60)

    # Ensure tables exist without wiping database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        async with session.begin():
            org, username, password = await get_or_create_demo_tenant(
                session, args.org_slug, args.org_name, args.username, args.password
            )
            events_count = await seed_events(session, org.id, args.events)
            chains_count = await seed_attack_chains(session, org.id)
            violations_count = await seed_compliance_violations(session, org.id)
            ml_count = await seed_ml_metrics(session)

        await session.commit()

    logger.info("=" * 60)
    logger.info("[DONE] Multi-Tenant Seeding Complete!")
    logger.info(f"   Target Organization: '{org.name}' (slug='{org.slug}', id={org.id})")
    logger.info(f"   Credentials: Username='{username}' | Password='{password}'")
    logger.info(f"   Events: {events_count} | Attack Chains: {chains_count} | Violations: {violations_count}")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
