"""
SIEM Analytics System - Authentication Routes

Endpoints:
  POST /api/auth/register  → Create a new user account
  POST /api/auth/login     → Authenticate and receive JWT token
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and organization",
    description="Creates a new account, a new organization, and assigns the user as owner.",
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    from app.models import Organization, OrganizationMembership

    async with db.begin():
        # Check if username already taken
        result = await db.execute(
            select(User).where(User.username == user_data.username)
        )
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{user_data.username}' is already registered",
            )

        # Check if org slug already taken
        org_result = await db.execute(
            select(Organization).where(Organization.slug == user_data.org_slug)
        )
        existing_org = org_result.scalar_one_or_none()
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Organization slug '{user_data.org_slug}' is already taken",
            )

        # First user of a newly registered organization is always admin
        role = "admin"

        # Create user with hashed password
        new_user = User(
            username=user_data.username,
            password_hash=hash_password(user_data.password),
            role=role,
        )
        db.add(new_user)
        await db.flush()  # to get new_user.id

        # Create Organization
        new_org = Organization(
            name=user_data.org_name,
            slug=user_data.org_slug,
            status="active"
        )
        db.add(new_org)
        await db.flush()  # to get new_org.id

        # Create Membership
        new_membership = OrganizationMembership(
            user_id=new_user.id,
            org_id=new_org.id,
            role=role
        )
        db.add(new_membership)

    await db.refresh(new_user)
    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get JWT token",
    description="Authenticates credentials and returns a Bearer JWT token valid for JWT_EXPIRY_MINUTES.",
)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    from app.models import OrganizationMembership

    # Find user and eager load memberships
    result = await db.execute(
        select(User).options(selectinload(User.memberships)).where(User.username == credentials.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Determine organization membership
    membership_count = len(user.memberships)
    if membership_count == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User has no organization membership",
        )
    if membership_count > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User belongs to multiple organizations; explicit org selection required.",
        )
    membership = user.memberships[0]
    org_id = membership.org_id
    role = membership.role

    # Create JWT token
    token = create_access_token(
        data={"sub": user.username, "role": role, "user_id": user.id, "org_id": org_id}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user.username,
        role=role,
        org_id=org_id
    )
