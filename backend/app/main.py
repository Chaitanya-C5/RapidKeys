import uvicorn
from fastapi import FastAPI
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, multiplayer
from app.config.db import Base, engine
from app.config.redis_config import redis_manager

Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(
    title="RapidKeys API",
    description="Backend API for RapidKeys typing test application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user.router, prefix="/api/v1", tags=["User"])
app.include_router(multiplayer.router, prefix="/api/v1/multiplayer", tags=["Multiplayer"])

@app.on_event("startup")
async def startup_event():
    """Initialize Redis connection on startup""" 
    await redis_manager.test_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to RapidKeys API"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )