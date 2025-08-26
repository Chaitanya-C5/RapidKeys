from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import json
import jwt
import os
from typing import Dict, List, Set
import uuid
from datetime import datetime
from app.models.sqlalchemy_user import User
from app.config.db import SessionLocal
from app.config.redis_config import redis_manager
import asyncio
import random
import string
from app.utils.word_generator import generate_words
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str, room_code: str, username: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

        room_data = await redis_manager.get_room(room_code)
        if not room_data:
            await websocket.close(code=1008, reason="Room not found")
            return

        is_host = room_data.get("creator_id") == user_id
        
        # Add user to room in Redis
        user_data = {
            "id": user_id,
            "username": username,
            "joined_at": datetime.now().isoformat(),
            "wpm": 0,
            "accuracy": 0,
            "progress": 0,
            "is_host": is_host
        }
        
        await redis_manager.add_user_to_room(room_code, user_id, user_data)
        room_data = await redis_manager.get_room(room_code)
        
        # Notify room about new user
        await self.broadcast_to_room(room_code, {
            "type": "user_joined",
            "user": user_data,
            "room_users": list(room_data["users"].values())
        })
        
        # Send room state to new user
        await self.send_personal_message({
            "type": "room_joined",
            "room": room_data,
            "your_id": user_id
        }, websocket)

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        # Schedule async cleanup
        asyncio.create_task(self._async_disconnect_cleanup(user_id))

    async def _async_disconnect_cleanup(self, user_id: str):
        # Get user's room from Redis
        room_code = await redis_manager.get_user_room(user_id)
        if room_code:
            # Get user info before removing
            room_data = await redis_manager.get_room(room_code)
            username = room_data["users"].get(user_id, {}).get("username", "Unknown") if room_data else "Unknown"
            
            # Remove user from room in Redis
            updated_room_data = await redis_manager.remove_user_from_room(room_code, user_id)
            
            # If room still exists, notify remaining users
            if updated_room_data:
                await self.broadcast_to_room(room_code, {
                    "type": "user_left",
                    "user_id": user_id,
                    "username": username,
                    "room_users": list(updated_room_data["users"].values())
                })

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except:
            pass

    async def broadcast_to_room(self, room_code: str, message: dict):
        room_data = await redis_manager.get_room(room_code)
        if not room_data:
            return
            
        disconnected_users = []
        for user_id in room_data["users"]:
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_text(json.dumps(message))
                except:
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    async def handle_chat_message(self, room_code: str, user_id: str, message: str):
        room_data = await redis_manager.get_room(room_code)
        if not room_data or user_id not in room_data["users"]:
            return
        
        username = room_data["users"][user_id]["username"]
        chat_message = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "username": username,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store message in Redis
        await redis_manager.add_message_to_room(room_code, chat_message)
        
        # Broadcast to all users in room
        await self.broadcast_to_room(room_code, {
            "type": "chat_message",
            "message": chat_message
        })

    async def handle_start_race(self, room_code: str, user_id: str):
        room_data = await redis_manager.get_room(room_code)
        if not room_data or user_id not in room_data["users"]:
            return

        mode = room_data["settings"]["mode"]
        submode = room_data["settings"]["value"]
        
        words = generate_words(mode, submode)
        await redis_manager.set_words(room_code, words)
        
        start_time = datetime.now().isoformat()
        await redis_manager.start_race(room_code, start_time)
        
        await self.broadcast_to_room(room_code, {
            "type": "race_started",
            "words": words,
            "start_time": start_time
        })

    async def handle_typing_progress(self, room_code: str, user_id: str, progress: int, wpm: int, accuracy: float):
        if await redis_manager.update_user_progress(room_code, user_id, progress, wpm, accuracy):
            await self.broadcast_to_room(room_code, {
                "type": "user_progress",
                "user_id": user_id,
                "progress": progress,
                "wpm": wpm,
                "accuracy": accuracy
            })

manager = ConnectionManager()

def verify_token(token: str, db):
    try:
        secret = os.getenv("JWT_SECRET")
        if not secret:
            return None
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            return None
        # If User.id is a UUID column, cast incoming string to UUID
        try:
            user_uuid = uuid.UUID(str(user_id))
            user = db.query(User).filter(User.id == user_uuid).first()
        except (ValueError, AttributeError):
            # Fallback for non-UUID string primary keys
            user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception:
        return None

async def generate_room_code() -> str:
    """Generate a unique 6-character room code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not await redis_manager.room_exists(code):
            return code

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    token = websocket.query_params.get("token")
    # Verify user authentication
    with SessionLocal() as db:
        user = verify_token(token, db)
    if not user:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    user_id = str(user.id)
    username = user.username
    
    await manager.connect(websocket, user_id, room_code, username)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "chat_message":
                await manager.handle_chat_message(room_code, user_id, message.get("message", ""))
            
            elif message_type == "start_race":
                await manager.handle_start_race(room_code, user_id)
            
            elif message_type == "typing_progress":
                progress = message.get("progress", 0)
                wpm = message.get("wpm", 0) 
                accuracy = message.get("accuracy", 0)
                await manager.handle_typing_progress(room_code, user_id, progress, wpm, accuracy)
    
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.post("/create-room")
async def create_room(settings: dict, token: str = Depends(oauth2_scheme)):
    with SessionLocal() as db:
        user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    room_code = await generate_room_code()
    # Create room with provided settings
    room_data = {
        "code": room_code,
        "creator_id": str(user.id),
        "users": {},
        "messages": [],
        "words": [],
        "created_at": datetime.now().isoformat(),
        "race_started": False,
        "settings": {
            "mode": settings.get("mode", "time"),
            "value": settings.get("value", 60),
            "difficulty": settings.get("difficulty", "medium")
        }
    }
    await redis_manager.create_room(room_code, room_data)
    
    return {
        "success": True,
        "room_code": room_code,
        "message": "Room created successfully"
    }

@router.get("/room/{room_code}")
async def get_room_info(room_code: str, token: str = Depends(oauth2_scheme)):
    with SessionLocal() as db:
        user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    room_data = await redis_manager.get_room(room_code)
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {
        "success": True,
        "room": {
            "code": room_data["code"],
            "user_count": len(room_data["users"]),
            "users": list(room_data["users"].values()),
            "race_started": room_data["race_started"],
            "words": room_data.get("words", []),
            "created_at": room_data["created_at"],
            "settings": room_data.get("settings", {})
        }
    }

@router.get("/active-rooms")
async def get_active_rooms(token: str = Depends(oauth2_scheme)):
    with SessionLocal() as db:
        user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    active_rooms = []
    room_codes = await redis_manager.get_active_rooms()
    
    for room_code in room_codes:
        room_data = await redis_manager.get_room(room_code)
        if room_data:
            active_rooms.append({
                "code": room_code,
                "user_count": len(room_data["users"]),
                "race_started": room_data["race_started"],
                "words": room_data.get("words", []),
                "created_at": room_data["created_at"]
            })
    
    return {
        "success": True,
        "rooms": active_rooms
    }
