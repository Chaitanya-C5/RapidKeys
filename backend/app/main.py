import uvicorn
from fastapi import FastAPI
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="RapidKeys API",
    description="Backend API for RapidKeys typing test application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to RapidKeys API"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        port=os.getenv("PORT", 8000),
        reload=True
    )