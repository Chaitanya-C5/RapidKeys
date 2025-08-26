from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.sql import func
from app.config.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=True)
    auth_provider = Column(String, nullable=False, default="credentials")
    best_wpm = Column(Integer, nullable=True, default=0)
    best_accuracy = Column(Float, nullable=True, default=0.0)
    total_games = Column(Integer, nullable=True, default=0)
    average_wpm = Column(Float, nullable=True, default=0.0)
    average_accuracy = Column(Float, nullable=True, default=0.0)
    created_at = Column(DateTime, nullable=False, default=func.now())