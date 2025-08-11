from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirmPassword: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: str
    password: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

class AuthResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    token: Optional[str] = None
    user: Optional[UserResponse] = None

class UsernameCheckResponse(BaseModel):
    available: bool
    message: str


