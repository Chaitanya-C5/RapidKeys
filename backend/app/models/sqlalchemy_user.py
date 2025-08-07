from sqlalchemy import Column, String, Integer
from app.config.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=True)
    auth_provider = Column(String, nullable=False, default="credentials")