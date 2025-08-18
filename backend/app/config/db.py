from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

engine = create_engine(
    os.getenv("DB_URL"),
    pool_size=5,          # per-process
    max_overflow=10,      # burst headroom
    pool_pre_ping=True,   # drop dead conns
    pool_recycle=1800     # recycle every 30m
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()