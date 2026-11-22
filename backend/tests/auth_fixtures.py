"""
Authentication fixtures module (re-exports from conftest for legacy imports).
All database lifecycle management is centralized in conftest.py to ensure isolation and prevent table collisions.
"""
from tests.conftest import (
    setup_db, reset_db, client,
    org_a, org_b,
    admin_a, analyst_a, manager_a, admin_b, analyst_b,
    admin_user, analyst_user, manager_user,
    admin_a_token, analyst_a_token, manager_a_token, admin_b_token, analyst_b_token,
    admin_token, analyst_token, manager_token,
    auth_headers, admin_auth_headers, manager_auth_headers, analyst_b_headers, admin_b_headers,
    auth_client, admin_auth_client, manager_auth_client, analyst_b_client, admin_b_client
)
