from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.CUSTOMER
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    is_verified: bool = False
    verification_date: Optional[datetime] = None
    is_pro: bool = False
    pro_expires_at: Optional[datetime] = None
    rating: float = 4.8
    avg_response_time_minutes: int = 15

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    is_verified: Optional[bool] = None
    is_pro: Optional[bool] = None

class UserInDBBase(UserBase):
    id: int
    is_online: bool
    created_at: datetime
    trust_score: Optional[int] = 85

    class Config:
        from_attributes = True

class UserResponse(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    type: Optional[str] = None
