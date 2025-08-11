from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import json
import jwt
import os
from typing import Dict, List, Set
import uuid
from datetime import datetime
from app.models.sqlalchemy_user import User
from app.utils.db_conn import db_dependency
import asyncio

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

# In-memory storage for rooms and connections
# In production, you'd use Redis or a database
rooms: Dict[str, Dict] = {}
connections: Dict[str, WebSocket] = {}
user_rooms: Dict[str, str] = {}  # user_id -> room_code

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.rooms: Dict[str, Dict] = {}
        self.user_rooms: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str, room_code: str, username: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_rooms[user_id] = room_code
        
        # Initialize room if it doesn't exist
        if room_code not in self.rooms:
            self.rooms[room_code] = {
                "code": room_code,
                "users": {},
                "messages": [],
                "created_at": datetime.now().isoformat(),
                "race_started": False
            }
        
        # Add user to room
        self.rooms[room_code]["users"][user_id] = {
            "id": user_id,
            "username": username,
            "joined_at": datetime.now().isoformat(),
            "ready": False,
            "wpm": 0,
            "progress": 0
        }
        
        # Notify room about new user
        await self.broadcast_to_room(room_code, {
            "type": "user_joined",
            "user": self.rooms[room_code]["users"][user_id],
            "room_users": list(self.rooms[room_code]["users"].values())
        })
        
        # Send room state to new user
        await self.send_personal_message({
            "type": "room_joined",
            "room": self.rooms[room_code],
            "your_id": user_id
        }, websocket)

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        if user_id in self.user_rooms:
            room_code = self.user_rooms[user_id]
            del self.user_rooms[user_id]
            
            # Remove user from room
            if room_code in self.rooms and user_id in self.rooms[room_code]["users"]:
                username = self.rooms[room_code]["users"][user_id]["username"]
                del self.rooms[room_code]["users"][user_id]
                
                # If room is empty, clean it up
                if not self.rooms[room_code]["users"]:
                    del self.rooms[room_code]
                else:
                    # Notify remaining users
                    asyncio.create_task(self.broadcast_to_room(room_code, {
                        "type": "user_left",
                        "user_id": user_id,
                        "username": username,
                        "room_users": list(self.rooms[room_code]["users"].values())
                    }))

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except:
            pass

    async def broadcast_to_room(self, room_code: str, message: dict):
        if room_code not in self.rooms:
            return
            
        disconnected_users = []
        for user_id in self.rooms[room_code]["users"]:
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_text(json.dumps(message))
                except:
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    async def handle_chat_message(self, room_code: str, user_id: str, message: str):
        if room_code not in self.rooms or user_id not in self.rooms[room_code]["users"]:
            return
        
        username = self.rooms[room_code]["users"][user_id]["username"]
        chat_message = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "username": username,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store message in room
        self.rooms[room_code]["messages"].append(chat_message)
        
        # Broadcast to all users in room
        await self.broadcast_to_room(room_code, {
            "type": "chat_message",
            "message": chat_message
        })

    async def handle_start_race(self, room_code: str, user_id: str):
        if room_code not in self.rooms:
            return
        
        # Only allow race start if user is in room
        if user_id not in self.rooms[room_code]["users"]:
            return
        
        self.rooms[room_code]["race_started"] = True
        self.rooms[room_code]["race_start_time"] = datetime.now().isoformat()
        
        await self.broadcast_to_room(room_code, {
            "type": "race_started",
            "start_time": self.rooms[room_code]["race_start_time"]
        })

manager = ConnectionManager()

def verify_token(token: str, db):
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except:
        return None

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, token: str, db: db_dependency):
    # Verify user authentication
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
                # Handle real-time typing progress updates
                progress = message.get("progress", 0)
                wpm = message.get("wpm", 0)
                
                if room_code in manager.rooms and user_id in manager.rooms[room_code]["users"]:
                    manager.rooms[room_code]["users"][user_id]["progress"] = progress
                    manager.rooms[room_code]["users"][user_id]["wpm"] = wpm
                    
                    await manager.broadcast_to_room(room_code, {
                        "type": "user_progress",
                        "user_id": user_id,
                        "progress": progress,
                        "wpm": wpm
                    })
            
            elif message_type == "toggle_ready":
                # Toggle user ready status
                if room_code in manager.rooms and user_id in manager.rooms[room_code]["users"]:
                    current_ready = manager.rooms[room_code]["users"][user_id]["ready"]
                    manager.rooms[room_code]["users"][user_id]["ready"] = not current_ready
                    
                    await manager.broadcast_to_room(room_code, {
                        "type": "user_ready_changed",
                        "user_id": user_id,
                        "ready": not current_ready,
                        "room_users": list(manager.rooms[room_code]["users"].values())
                    })
    
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.post("/create-room")
async def create_room(db: db_dependency, token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Generate unique room code
    room_code = ''.join([chr(65 + i) for i in [__import__('random').randint(0, 25) for _ in range(6)]])
    
    return {
        "success": True,
        "room_code": room_code,
        "message": "Room created successfully"
    }

@router.get("/room/{room_code}")
async def get_room_info(room_code: str, db: db_dependency, token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if room_code not in manager.rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = manager.rooms[room_code]
    return {
        "success": True,
        "room": {
            "code": room["code"],
            "user_count": len(room["users"]),
            "users": list(room["users"].values()),
            "race_started": room["race_started"],
            "created_at": room["created_at"]
        }
    }

