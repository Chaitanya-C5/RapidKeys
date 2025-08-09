from fastapi import APIRouter, status, Body, Depends
from app.models.user import UserCreate
from app.models.sqlalchemy_user import User
from app.utils.db_conn import db_dependency
import os
from dotenv import load_dotenv
from fastapi.responses import RedirectResponse
import urllib.parse
import requests
from sqlalchemy.orm import Session
import jwt
from app.utils.hasher import get_password_hash

load_dotenv()


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")


router = APIRouter()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(db: db_dependency, user: UserCreate = Body(...)):
    user = User(username=user.username, email=user.email, password=get_password_hash(user.password))
    db.add(user)
    db.commit()

@router.get("/auth/google")
def google_login():
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

@router.get("/auth/google/callback")
def google_callback(db: db_dependency, code: str):
    # 1. Exchange the code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    token_r = requests.post(token_url, data=token_data)
    token_json = token_r.json()

    if "error" in token_json:
        return {"error": token_json}

    access_token = token_json.get("access_token")

    userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    userinfo_r = requests.get(
        userinfo_url,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    userinfo = userinfo_r.json()

    user = db.query(User).filter(User.email == userinfo["email"]).first()
    if not user:
        user = User(
            username=userinfo["given_name"],
            email=userinfo["email"],
            auth_provider="google",
            password=""
        )
        db.add(user)
        db.commit()

    token = jwt.encode(
        {"sub": str(user.id)},
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    frontend_url = f"{os.getenv('FRONTEND_URL')}/google-success?token={token}"
    return RedirectResponse(frontend_url)