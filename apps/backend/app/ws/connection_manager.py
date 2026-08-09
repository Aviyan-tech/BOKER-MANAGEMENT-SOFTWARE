from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> list of active WebSockets (allows multi-tab connection)
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Maps room_id -> list of (user_id, WebSocket)
        self.room_connections: Dict[str, List[tuple[int, WebSocket]]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
        # Clean up any room connections
        for room_id in list(self.room_connections.keys()):
            self.room_connections[room_id] = [
                (u_id, ws) for u_id, ws in self.room_connections[room_id] if ws != websocket
            ]
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might have died
                    pass

    async def join_room(self, room_id: str, user_id: int, websocket: WebSocket):
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        # Check if already joined
        if not any(ws == websocket for _, ws in self.room_connections[room_id]):
            self.room_connections[room_id].append((user_id, websocket))

    async def leave_room(self, room_id: str, websocket: WebSocket):
        if room_id in self.room_connections:
            self.room_connections[room_id] = [
                (u_id, ws) for u_id, ws in self.room_connections[room_id] if ws != websocket
            ]
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_websocket: WebSocket = None):
        if room_id in self.room_connections:
            for _, ws in self.room_connections[room_id]:
                if ws != exclude_websocket:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass

    async def broadcast(self, message: dict):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

# Singleton manager
manager = ConnectionManager()

async def create_notification(user_id: int, notif_type: str, payload: dict, db):
    from app.models.notification import Notification
    
    db_notif = Notification(
        user_id=user_id,
        type=notif_type,
        payload=payload
    )
    db.add(db_notif)
    await db.commit()
    await db.refresh(db_notif)
    
    await manager.send_personal_message({
        "event": "notification:new",
        "data": {
            "id": db_notif.id,
            "type": notif_type,
            "payload": payload,
            "created_at": db_notif.created_at.isoformat()
        }
    }, user_id)

