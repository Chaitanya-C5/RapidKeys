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
    best_wpm: Optional[int] = 0
    best_accuracy: Optional[float] = 0.0
    total_games: Optional[int] = 0
    average_wpm: Optional[float] = 0.0
    average_accuracy: Optional[float] = 0.0

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    best_wpm: Optional[int] = 0
    best_accuracy: Optional[float] = 0.0
    total_games: Optional[int] = 0
    average_wpm: Optional[float] = 0.0
    average_accuracy: Optional[float] = 0.0

class UserStatsUpdate(BaseModel):
    wpm: int
    accuracy: float
    mode: str  # "time" or "words"
    duration: Optional[int] = None
    word_count: Optional[int] = None

class AuthResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    token: Optional[str] = None
    user: Optional[UserResponse] = None

class UsernameCheckResponse(BaseModel):
    available: bool
    message: str
