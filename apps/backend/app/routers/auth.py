from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import secrets
import google.oauth2.id_token
import google.auth.transport.requests

from app.core import security
from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, Token, TokenPayload
from jose import jwt, JWTError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    # Check if email exists
    result = await db.execute(select(User).filter(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Hash password
    hashed_password = security.get_password_hash(user_in.password)
    
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        password_hash=hashed_password,
        role=user_in.role,
        avatar_url=user_in.avatar_url or f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_in.name.replace(' ', '')}",
        is_online=False
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Authenticate user
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Update presence
    user.is_online = True
    await db.commit()
    await db.refresh(user)
    
    # Access & Refresh Tokens
    access_token = security.create_access_token(subject=user.id, role=user.role.value)
    refresh_token = security.create_refresh_token(subject=user.id, role=user.role.value)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": user.id,
        "name": user.name
    }

# Also support JSON login body for frontend calls that don't use form-data
from pydantic import BaseModel
class JSONLogin(BaseModel):
    email: str
    password: str

@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: JSONLogin,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).filter(User.email == login_data.email))
    user = result.scalars().first()
    if not user or not security.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    user.is_online = True
    await db.commit()
    await db.refresh(user)
    
    access_token = security.create_access_token(subject=user.id, role=user.role.value)
    refresh_token = security.create_refresh_token(subject=user.id, role=user.role.value)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": user.id,
        "name": user.name
    }

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=Token)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    try:
        token_payload = jwt.decode(
            payload.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**token_payload)
        if token_data.type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type, refresh token required",
            )
    except (JWTError, Exception):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate refresh credentials",
        )
    
    user_id = int(token_data.sub)
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate new tokens
    access_token = security.create_access_token(subject=user.id, role=user.role.value)
    new_refresh_token = security.create_refresh_token(subject=user.id, role=user.role.value)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": user.id,
        "name": user.name
    }

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    current_user.is_online = False
    await db.commit()
    return {"message": "Successfully logged out"}

class GoogleAuthRequest(BaseModel):
    credential: str
    role: Optional[UserRole] = None

@router.post("/google", response_model=Token)
async def google_auth(
    request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Google Sign-In endpoint.
    Verifies Google ID token and returns our own access/refresh tokens.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication is not configured"
        )
    
    try:
        # Verify the Google token (blocking operation, run in threadpool)
        id_info = await run_in_threadpool(
            google.oauth2.id_token.verify_oauth2_token,
            request.credential,
            google.auth.transport.requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # Require email verification
        if not id_info.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email is not verified by Google"
            )
        
        email = id_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No email in Google profile"
            )
        
        # Look up user by email
        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        
        # Create user if doesn't exist
        if not user:
            # Sanitize role: only allow CUSTOMER, AGENT, SELLER
            role = request.role if request.role in [UserRole.CUSTOMER, UserRole.AGENT, UserRole.SELLER] else UserRole.CUSTOMER
            
            # Generate unusable password
            unusable_password = security.get_password_hash(secrets.token_urlsafe(32))
            
            user = User(
                email=email,
                name=id_info.get("name", email.split("@")[0]),
                password_hash=unusable_password,
                role=role,
                avatar_url=id_info.get("picture", f"https://api.dicebear.com/7.x/adventurer/svg?seed={id_info.get('name', email)}"),
                is_online=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            # Update is_online for existing user
            user.is_online = True
            await db.commit()
            await db.refresh(user)
        
        # Generate our tokens
        access_token = security.create_access_token(subject=user.id, role=user.role.value)
        refresh_token = security.create_refresh_token(subject=user.id, role=user.role.value)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user.role.value,
            "user_id": user.id,
            "name": user.name
        }
    
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    current_user.is_online = False
    await db.commit()
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user
