#!/usr/bin/env python3
"""
SentriX SIEM — Live Traffic Simulator

Generates realistic security events and sends them to the running SIEM API.
Simulates normal traffic interspersed with attack patterns:
  - SSH brute-force login storms
  - Port scanning sweeps
  - Data exfiltration bursts
  - Privilege escalation attempts
  - Normal authentication and network events

Usage:
  1. Start the backend:  cd backend && uvicorn app.main:app --reload
  2. Register or log in to get credentials
  3. Run:  python traffic_sim.py --api http://localhost:8000 --username <user> --password <pass>

The simulator authenticates, then continuously sends events.
The dashboard will update in real-time via WebSocket as events flow in.
Press Ctrl+C to stop.
"""

import argparse
import random
import time
import sys
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    print("ERROR: 'requests' library required. Install with: pip install requests")
    sys.exit(1)


# ─── Attack Scenario Definitions ───────────────────────────────────────────────

ATTACKER_IPS = ["185.220.101.35", "45.33.32.156", "91.240.118.42", "198.51.100.77"]
INTERNAL_IPS = ["10.0.0.5", "10.0.0.12", "10.0.0.25", "10.0.0.100", "192.168.1.50"]
LEGIT_USERS = ["j.martinez", "a.chen", "s.patel", "m.johnson", "r.kim"]
ATTACKER_USERS = ["admin", "root", "administrator", "sa", "sysadmin"]
COUNTRIES = {"legit": ["US", "IN", "GB", "DE"], "threat": ["RU", "CN", "KP", "IR"]}

NORMAL_EVENT_TYPES = ["login_success", "logout", "file_access", "network_connection"]
ATTACK_EVENT_TYPES = ["login_failure", "ssh_brute_force", "port_scan", "privilege_escalation", "data_exfiltration"]

SCAN_PORTS = [22, 23, 80, 443, 445, 3389, 8080, 8443, 3306, 5432, 1433, 27017]


def make_normal_event() -> dict:
    """Generate a benign event — normal user activity."""
    return {
        "source_ip": random.choice(INTERNAL_IPS),
        "destination_ip": random.choice(INTERNAL_IPS),
        "username": random.choice(LEGIT_USERS),
        "event_type": random.choice(NORMAL_EVENT_TYPES),
        "login_status": "success",
        "failed_attempts": 0,
        "destination_port": random.choice([443, 8080, 22]),
        "protocol": "TCP",
        "bytes_transferred": random.randint(100, 50000),
        "device_type": random.choice(["workstation", "laptop", "server"]),
        "country": random.choice(COUNTRIES["legit"]),
        "severity": "Low",
        "label": "Normal",
    }


def make_brute_force_event(burst_num: int) -> dict:
    """Generate a brute-force SSH login attempt — multiple failed logins from one IP."""
    attacker_ip = random.choice(ATTACKER_IPS)
    return {
        "source_ip": attacker_ip,
        "destination_ip": random.choice(INTERNAL_IPS),
        "username": random.choice(ATTACKER_USERS),
        "event_type": "ssh_brute_force" if burst_num > 3 else "login_failure",
        "login_status": "failed",
        "failed_attempts": burst_num,
        "destination_port": 22,
        "protocol": "TCP",
        "bytes_transferred": random.randint(200, 800),
        "device_type": "server",
        "country": random.choice(COUNTRIES["threat"]),
        "alert_type": "Authentication Anomaly",
        "severity": "Critical" if burst_num > 5 else "High",
        "label": "Brute Force",
    }


def make_port_scan_event(port_idx: int) -> dict:
    """Generate a port scan probe — rapid connections to sequential ports."""
    attacker_ip = random.choice(ATTACKER_IPS)
    return {
        "source_ip": attacker_ip,
        "destination_ip": random.choice(INTERNAL_IPS),
        "username": None,
        "event_type": "port_scan",
        "login_status": None,
        "failed_attempts": 0,
        "destination_port": SCAN_PORTS[port_idx % len(SCAN_PORTS)],
        "protocol": "TCP",
        "bytes_transferred": random.randint(40, 200),
        "device_type": "firewall",
        "country": random.choice(COUNTRIES["threat"]),
        "alert_type": "Reconnaissance",
        "severity": "High" if port_idx > 5 else "Medium",
        "label": "Port Scan",
    }


def make_exfiltration_event() -> dict:
    """Generate a data exfiltration event — large outbound transfer to external IP."""
    return {
        "source_ip": random.choice(INTERNAL_IPS),
        "destination_ip": random.choice(ATTACKER_IPS),
        "username": random.choice(LEGIT_USERS),
        "event_type": "data_exfiltration",
        "login_status": "success",
        "failed_attempts": 0,
        "destination_port": 443,
        "protocol": "TCP",
        "bytes_transferred": random.randint(50_000_000, 800_000_000),
        "device_type": "server",
        "country": random.choice(COUNTRIES["threat"]),
        "alert_type": "Data Loss Prevention",
        "severity": "Critical",
        "label": "Data Exfiltration",
    }


def make_privilege_escalation_event() -> dict:
    """Generate a privilege escalation attempt."""
    return {
        "source_ip": random.choice(INTERNAL_IPS),
        "destination_ip": random.choice(INTERNAL_IPS),
        "username": random.choice(LEGIT_USERS),
        "event_type": "privilege_escalation",
        "login_status": "success",
        "failed_attempts": 0,
        "destination_port": 445,
        "protocol": "TCP",
        "bytes_transferred": random.randint(1000, 10000),
        "device_type": "server",
        "country": random.choice(COUNTRIES["legit"]),
        "alert_type": "Privilege Escalation",
        "severity": "Critical",
        "label": "Privilege Escalation",
    }


# ─── Main Simulator ────────────────────────────────────────────────────────────

def authenticate(api_base: str, username: str, password: str) -> str:
    """Login and return JWT token."""
    resp = requests.post(f"{api_base}/api/auth/login", json={
        "username": username,
        "password": password,
    })
    if resp.status_code != 200:
        print(f"[ERROR] Login failed ({resp.status_code}): {resp.text}")
        sys.exit(1)
    token = resp.json()["access_token"]
    print(f"[OK] Authenticated as '{username}' — token acquired")
    return token


def send_event(api_base: str, token: str, event: dict) -> bool:
    """Send a single security event to the ingestion endpoint."""
    event["timestamp"] = datetime.now(timezone.utc).isoformat()
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.post(f"{api_base}/api/events", json=event, headers=headers, timeout=10)
        return resp.status_code == 201
    except requests.RequestException as e:
        print(f"  [WARN] Request failed: {e}")
        return False


def run_simulation(api_base: str, token: str, speed: float = 1.0, duration: int = 0):
    """
    Run the traffic simulation loop.

    Attack pattern schedule (repeating cycle every ~90 seconds):
      Phase 1 (0-20s):   Normal traffic — baseline activity
      Phase 2 (20-40s):  Brute-force SSH attack — 8 rapid failed logins
      Phase 3 (40-55s):  Port scanning sweep — 12 ports probed
      Phase 4 (55-70s):  Data exfiltration burst — 3 large transfers
      Phase 5 (70-80s):  Privilege escalation — 2 attempts
      Phase 6 (80-90s):  Normal traffic — cooldown
    """
    cycle_duration = 90  # seconds per attack cycle
    event_count = 0
    alert_count = 0
    start_time = time.time()

    print(f"\n{'='*60}")
    print(f"  SentriX Traffic Simulator — LIVE")
    print(f"  Target: {api_base}")
    print(f"  Speed:  {speed}x")
    print(f"  Press Ctrl+C to stop")
    print(f"{'='*60}\n")

    try:
        while True:
            elapsed = time.time() - start_time
            if duration > 0 and elapsed >= duration:
                break

            cycle_pos = elapsed % cycle_duration

            # Phase 1 & 6: Normal traffic
            if cycle_pos < 20 or cycle_pos >= 80:
                event = make_normal_event()
                phase = "NORMAL"
                delay = random.uniform(0.8, 2.0) / speed

            # Phase 2: Brute-force attack
            elif cycle_pos < 40:
                burst_num = int((cycle_pos - 20) / 2.5) + 1
                event = make_brute_force_event(burst_num)
                phase = "🔴 BRUTE FORCE"
                delay = random.uniform(0.3, 0.8) / speed

            # Phase 3: Port scanning
            elif cycle_pos < 55:
                port_idx = int((cycle_pos - 40) / 1.25)
                event = make_port_scan_event(port_idx)
                phase = "🟡 PORT SCAN"
                delay = random.uniform(0.2, 0.5) / speed

            # Phase 4: Data exfiltration
            elif cycle_pos < 70:
                event = make_exfiltration_event()
                phase = "🔴 EXFILTRATION"
                delay = random.uniform(2.0, 4.0) / speed

            # Phase 5: Privilege escalation
            else:
                event = make_privilege_escalation_event()
                phase = "🔴 PRIV ESCALATION"
                delay = random.uniform(1.5, 3.0) / speed

            success = send_event(api_base, token, event)
            event_count += 1
            is_attack = event.get("severity") in ("High", "Critical")
            if is_attack:
                alert_count += 1

            status = "✓" if success else "✗"
            sev = event.get("severity", "Low")
            print(
                f"  [{status}] #{event_count:04d} | {phase:<20s} | "
                f"severity={sev:<8s} | {event['event_type']:<25s} | "
                f"src={event['source_ip']:<18s} | alerts_triggered={alert_count}"
            )

            time.sleep(delay)

    except KeyboardInterrupt:
        pass

    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"  Simulation Complete")
    print(f"  Duration:     {elapsed:.0f}s")
    print(f"  Total Events: {event_count}")
    print(f"  Alerts:       {alert_count}")
    print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(
        description="SentriX SIEM — Live Traffic Simulator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run against local dev server
  python traffic_sim.py --username myuser --password mypass

  # Run against deployed Render backend
  python traffic_sim.py --api https://your-backend.onrender.com --username myuser --password mypass

  # Run faster (2x speed) for a quick demo
  python traffic_sim.py --username myuser --password mypass --speed 2

  # Run for exactly 90 seconds (one full attack cycle)
  python traffic_sim.py --username myuser --password mypass --duration 90
        """,
    )
    parser.add_argument("--api", default="http://localhost:8000", help="Backend API base URL (default: http://localhost:8000)")
    parser.add_argument("--username", required=True, help="Username to authenticate with")
    parser.add_argument("--password", required=True, help="Password")
    parser.add_argument("--speed", type=float, default=1.0, help="Speed multiplier (default: 1.0, use 2-3 for faster demo)")
    parser.add_argument("--duration", type=int, default=0, help="Auto-stop after N seconds (default: 0 = run forever)")

    args = parser.parse_args()

    token = authenticate(args.api, args.username, args.password)
    run_simulation(args.api, token, speed=args.speed, duration=args.duration)


if __name__ == "__main__":
    main()
