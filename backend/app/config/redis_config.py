import redis.asyncio as redis
import os
from dotenv import load_dotenv
import json
from typing import Optional, Dict, Any, List

load_dotenv()

class RedisManager:
    def __init__(self):
        redis_url = os.getenv("REDIS_CLOUD_URL")
        if redis_url:
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=float(os.getenv("REDIS_CONNECT_TIMEOUT", 5)),
            )
        else:
            raise ValueError("REDIS_CLOUD_URL is not set")
        
    async def test_connection(self):
        """Test Redis connection"""
        try:
            await self.redis_client.ping()
            print("✅ Redis connection established")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to Redis: {e}")
            return False

    # Room management
    async def create_room(self, room_code: str, room_data: Dict[str, Any]) -> bool:
        """Create a new room with initial data"""
        key = f"room:{room_code}"
        result = await self.redis_client.hset(key, mapping={
            "data": json.dumps(room_data),
            "created_at": room_data.get("created_at", ""),
            "user_count": 0
        })
        # Set expiry for room (24 hours)
        await self.redis_client.expire(key, 86400)
        return result

    async def get_room(self, room_code: str) -> Optional[Dict[str, Any]]:
        """Get room data"""
        key = f"room:{room_code}"
        room_data = await self.redis_client.hget(key, "data")
        if room_data:
            return json.loads(room_data)
        return None

    async def update_room(self, room_code: str, room_data: Dict[str, Any]) -> bool:
        """Update room data"""
        key = f"room:{room_code}"
        return await self.redis_client.hset(key, "data", json.dumps(room_data))

    async def delete_room(self, room_code: str) -> bool:
        """Delete a room"""
        key = f"room:{room_code}"
        result = await self.redis_client.delete(key)
        return result > 0

    async def room_exists(self, room_code: str) -> bool:
        """Check if room exists"""
        key = f"room:{room_code}"
        result = await self.redis_client.exists(key)
        return result > 0

    # User management
    async def add_user_to_room(self, room_code: str, user_id: str, user_data: Dict[str, Any]) -> bool:
        """Add user to room"""
        room_data = await self.get_room(room_code)
        if room_data:
            room_data["users"][user_id] = user_data
            await self.update_room(room_code, room_data)
            
            # Update user count
            await self.redis_client.hset(f"room:{room_code}", "user_count", len(room_data["users"]))
            
            # Track user's current room
            await self.redis_client.set(f"user_room:{user_id}", room_code, ex=3600)  # 1 hour expiry
            return True
        return False

    async def remove_user_from_room(self, room_code: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Remove user from room and return updated room data"""
        room_data = await self.get_room(room_code)
        if room_data and user_id in room_data["users"]:
            user_data = room_data["users"].pop(user_id)
            
            # If room is empty, delete it
            if not room_data["users"]:
                await self.delete_room(room_code)
                await self.redis_client.delete(f"user_room:{user_id}")
                return None
            else:
                await self.update_room(room_code, room_data)
                await self.redis_client.hset(f"room:{room_code}", "user_count", len(room_data["users"]))
                await self.redis_client.delete(f"user_room:{user_id}")
                return room_data
        return None

    async def get_user_room(self, user_id: str) -> Optional[str]:
        """Get the room code the user is currently in"""
        return await self.redis_client.get(f"user_room:{user_id}")

    # Chat management
    async def add_message_to_room(self, room_code: str, message: Dict[str, Any]) -> bool:
        """Add a chat message to room"""
        room_data = await self.get_room(room_code)
        if room_data:
            room_data["messages"].append(message)
            # Keep only last 100 messages to prevent memory bloat
            if len(room_data["messages"]) > 100:
                room_data["messages"] = room_data["messages"][-100:]
            return await self.update_room(room_code, room_data)
        return False

    async def update_user_progress(self, room_code: str, user_id: str, progress: int, wpm: int) -> bool:
        """Update user's typing progress"""
        room_data = await self.get_room(room_code)
        if room_data and user_id in room_data["users"]:
            room_data["users"][user_id]["progress"] = progress
            room_data["users"][user_id]["wpm"] = wpm
            return await self.update_room(room_code, room_data)
        return False

    async def update_user_ready_status(self, room_code: str, user_id: str, ready: bool) -> Optional[Dict[str, Any]]:
        """Update user's ready status and return updated room data"""
        room_data = await self.get_room(room_code)
        if room_data and user_id in room_data["users"]:
            room_data["users"][user_id]["ready"] = ready
            await self.update_room(room_code, room_data)
            return room_data
        return None

    async def start_race(self, room_code: str, start_time: str) -> bool:
        """Mark race as started"""
        room_data = await self.get_room(room_code)
        if room_data:
            room_data["race_started"] = True
            room_data["race_start_time"] = start_time
            return await self.update_room(room_code, room_data)
        return False

    # Connection tracking
    async def track_connection(self, user_id: str, connection_id: str):
        """Track active WebSocket connection"""
        await self.redis_client.set(f"connection:{user_id}", connection_id, ex=3600)

    async def remove_connection(self, user_id: str):
        """Remove connection tracking"""
        await self.redis_client.delete(f"connection:{user_id}")

    async def get_active_rooms(self) -> List[str]:
        """Get list of all active room codes"""
        keys = await self.redis_client.keys("room:*")
        return [key.split(":", 1)[1] for key in keys]

    async def cleanup_expired_rooms(self):
        """Clean up rooms that haven't been active for a while"""
        # This could be run periodically
        pass

# Global Redis manager instance
redis_manager = RedisManager()
