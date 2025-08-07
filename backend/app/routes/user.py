from fastapi import APIRouter, status, HTTPException, Body, Path
from app.models.user import UserCreate
from app.models.sqlalchemy_user import User
from app.utils.db_conn import db_dependency


router = APIRouter()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(db: db_dependency, user: UserCreate = Body(...)):
    user = User(username=user.username, email=user.email, password=user.password)
    db.add(user)
    db.commit()
    return {"message": "User created successfully"}