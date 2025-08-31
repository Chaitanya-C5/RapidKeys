from fastapi import APIRouter, status, Body, Depends
from app.models.user import UserCreate, UserLogin, UserStatsUpdate, ForgotPasswordRequest, UsernameCheck, VerifyResetCodeRequest, ResetPasswordRequest
from app.models.sqlalchemy_user import User
from app.utils.db_conn import db_dependency
import os
from dotenv import load_dotenv
from fastapi.responses import RedirectResponse
import urllib.parse
import requests
from sqlalchemy.orm import Session
import jwt
from app.utils.hasher import get_password_hash, verify_password
from app.utils.email_service import generate_reset_code, send_reset_code_email, get_reset_code_expiry
import os
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")  

router = APIRouter()

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

    token = jwt.encode(
        {"sub": str(user.id)},
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    new_user = { "id": user.id, "username": user.username, "email": user.email, "auth_provider": "credentials" }

    return {"success": True, "token": token, "user": new_user}

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
            username=None,
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
 
@router.get("/profile")
def get_profile(db: db_dependency, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user = db.query(User).filter(User.id == payload["sub"]).first()
        
        if not user:
            return {"success": False, "error": "User not found"}
        
        user_data = {
            "id": user.id, 
            "username": user.username, 
            "email": user.email, 
            "auth_provider": user.auth_provider,
            "best_wpm": user.best_wpm or 0,
            "best_accuracy": user.best_accuracy or 0.0,
            "total_games": user.total_games or 0,
            "average_wpm": user.average_wpm or 0.0,
            "average_accuracy": user.average_accuracy or 0.0,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        return {"success": True, "user": user_data, "token": token}  
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/login")
def login(db: db_dependency, user: UserLogin = Body(...)):
    user_in_db = db.query(User).filter(User.email == user.email).first()
    if not user_in_db:
        return {"success": False, "error": "User not found"}
    if not verify_password(user.password, user_in_db.password):
        return {"success": False, "error": "Incorrect password"}
    token = jwt.encode(
        {"sub": str(user_in_db.id)},
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    new_user = { "id": user_in_db.id, "username": user_in_db.username, "email": user_in_db.email, "auth_provider": "credentials" }

    return {"success": True, "token": token, "user": new_user}

@router.post("/update-stats")
def update_stats(db: db_dependency, stats: UserStatsUpdate = Body(...), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user = db.query(User).filter(User.id == payload["sub"]).first()
        
        if not user:
            return {"success": False, "error": "User not found"}
        
        # Update best scores
        if stats.wpm > (user.best_wpm or 0):
            user.best_wpm = stats.wpm
        
        if stats.accuracy > (user.best_accuracy or 0.0):
            user.best_accuracy = stats.accuracy
        
        # Update total games
        user.total_games = (user.total_games or 0) + 1
        
        # Calculate new averages
        current_total_wpm = (user.average_wpm or 0.0) * ((user.total_games or 1) - 1)
        user.average_wpm = (current_total_wpm + stats.wpm) / user.total_games
        
        current_total_accuracy = (user.average_accuracy or 0.0) * ((user.total_games or 1) - 1)
        user.average_accuracy = (current_total_accuracy + stats.accuracy) / user.total_games
        
        db.commit()
        
        return {
            "success": True,
            "stats": {
                "best_wpm": user.best_wpm,
                "best_accuracy": user.best_accuracy,
                "total_games": user.total_games,
                "average_wpm": round(user.average_wpm, 2),
                "average_accuracy": round(user.average_accuracy, 2)
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/forgot-password")
def forgot_password(db: db_dependency, request: ForgotPasswordRequest = Body(...)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    reset_code = generate_reset_code()
    user.reset_code = reset_code
    user.reset_code_expires = datetime.utcnow() + get_reset_code_expiry()
    db.commit()
    
    email_sent = send_reset_code_email(user.email, reset_code)
    if not email_sent:
        return {"success": False, "error": "Failed to send email"}
    
    return {"success": True, "message": "Reset code sent to your email"}

@router.post("/verify-reset-code")
def verify_reset_code(db: db_dependency, request: VerifyResetCodeRequest = Body(...)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    if not user.reset_code or user.reset_code != request.code:
        return {"success": False, "error": "Invalid reset code"}
    
    from datetime import datetime, timezone
    if not user.reset_code_expires or user.reset_code_expires < datetime.now(timezone.utc):
        return {"success": False, "error": "Reset code has expired"}
    
    return {"success": True, "message": "Reset code verified"}

@router.post("/reset-password")
def reset_password(db: db_dependency, request: ResetPasswordRequest = Body(...)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    if not user.reset_code or user.reset_code != request.code:
        return {"success": False, "error": "Invalid reset code"}
    
    from datetime import datetime, timezone
    if not user.reset_code_expires or user.reset_code_expires < datetime.now(timezone.utc):
        return {"success": False, "error": "Reset code has expired"}
    
    user.password = get_password_hash(request.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()
    
    return {"success": True, "message": "Password reset successful"}

@router.get("/leaderboard")
def get_leaderboard(db: db_dependency, limit: int = 50):
    try:
        # Fetch users sorted by best_wpm descending, then by best_accuracy descending
        users = db.query(User).filter(
            User.best_wpm.isnot(None),
            User.best_wpm > 0
        ).order_by(
            User.best_wpm.desc(),
            User.best_accuracy.desc()
        ).limit(limit).all()
        
        leaderboard_data = []
        for index, user in enumerate(users, 1):
            leaderboard_data.append({
                "position": index,
                "username": user.username,
                "wpm": user.best_wpm or 0,
                "accuracy": round(user.best_accuracy or 0, 1),
                "total_games": user.total_games or 0
            })
        
        return {
            "success": True,
            "leaderboard": leaderboard_data,
            "total_users": len(leaderboard_data)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/check-username")
def check_username(db: db_dependency, payload: UsernameCheck = Body(...)):
    try:
        user = db.query(User).filter(User.username.ilike(payload.username)).first()
        return {"available": user is None}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/update-username")
def update_username(db: db_dependency, request: UsernameCheck = Body(...), token: str = Depends(oauth2_scheme)):
    try:
        user = db.query(User).filter(User.username.ilike(request.username)).first()
        if user:
            return {"success": False, "error": "Username already exists"}
        
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user = db.query(User).filter(User.id == payload["sub"]).first()
        
        if not user:
            return {"success": False, "error": "User not found"}
        
        print("User found:", user)
        user.username = request.username
        db.commit()
        
        return {"success": True, "message": "Username updated successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}
