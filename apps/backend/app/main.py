from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import json
from datetime import datetime, timezone
from jose import jwt

from app.core.config import settings
from app.db.session import SessionLocal
from app.routers import auth, listings, deals, messages, offers, admin, notifications, brokers
from app.ws.connection_manager import manager
from app.models.user import User, UserRole
from app.models.message import Message
from app.models.offer import Offer, OfferStatus
from app.models.deal import Deal, DealStage, DealStageHistory
from app.models.listing import Listing
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(listings.router, prefix=settings.API_V1_STR)
app.include_router(deals.router, prefix=settings.API_V1_STR)
app.include_router(messages.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(brokers.router, prefix=settings.API_V1_STR)

# Ensure public images directory exists
images_dir = os.path.join(settings.UPLOADS_DIR, "images")
os.makedirs(images_dir, exist_ok=True)

# Mount public uploads for images
app.mount("/uploads/images", StaticFiles(directory=images_dir), name="images")

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Land Broker Platform API",
        "docs": "/docs"
    }

# Helper to decode token in websockets
def get_user_id_from_token(token: str) -> tuple[int, str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return int(payload.get("sub")), payload.get("role")
    except Exception:
        raise ValueError("Invalid credentials")


# 1. Chat Socket (Agent-to-Agent and Agent-Customer chat)
@app.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        user_id, role = get_user_id_from_token(token)
    except Exception:
        await websocket.close(code=1008)  # Policy violation
        return

    await manager.connect(user_id, websocket)

    # Set user online in DB and broadcast presence
    async with SessionLocal() as db:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if user:
            user.is_online = True
            await db.commit()
            await manager.broadcast({
                "event": "presence:online",
                "data": {"user_id": user_id, "name": user.name}
            })

    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            event = payload.get("event")
            data = payload.get("data", {})

            if event == "chat:message":
                receiver_id = data.get("receiver_id")
                content = data.get("content")
                deal_id = data.get("deal_id")

                async with SessionLocal() as db:
                    # Save message
                    db_msg = Message(
                        sender_id=user_id,
                        receiver_id=receiver_id,
                        deal_id=deal_id,
                        content=content
                    )
                    db.add(db_msg)
                    await db.commit()
                    await db.refresh(db_msg)

                    # Trigger in-app notification
                    from app.ws.connection_manager import create_notification
                    await create_notification(
                        user_id=receiver_id,
                        notif_type="new_message",
                        payload={
                            "sender_name": user.name if user else "Someone",
                            "deal_id": deal_id,
                            "content": content[:50] + "..." if len(content) > 50 else content
                        },
                        db=db
                    )

                    # Build message payload
                    msg_payload = {
                        "event": "chat:message",
                        "data": {
                            "id": db_msg.id,
                            "sender_id": user_id,
                            "receiver_id": receiver_id,
                            "deal_id": deal_id,
                            "content": content,
                            "created_at": db_msg.created_at.isoformat()
                        }
                    }

                    # Send to sender & receiver
                    await manager.send_personal_message(msg_payload, user_id)
                    await manager.send_personal_message(msg_payload, receiver_id)

            elif event == "chat:typing":
                receiver_id = data.get("receiver_id")
                is_typing = data.get("is_typing", False)
                deal_id = data.get("deal_id")

                await manager.send_personal_message({
                    "event": "chat:typing",
                    "data": {
                        "sender_id": user_id,
                        "deal_id": deal_id,
                        "is_typing": is_typing
                    }
                }, receiver_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        async with SessionLocal() as db:
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalars().first()
            if user:
                user.is_online = False
                await db.commit()
                await manager.broadcast({
                    "event": "presence:offline",
                    "data": {"user_id": user_id}
                })


# 2. Live Negotiation Room Socket
@app.websocket("/ws/negotiation/{deal_id}")
async def websocket_negotiation_endpoint(websocket: WebSocket, deal_id: int, token: str = Query(...)):
    try:
        user_id, role = get_user_id_from_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    # Check database to see if user belongs to this deal
    async with SessionLocal() as db:
        result = await db.execute(select(Deal).filter(Deal.id == deal_id))
        deal = result.scalars().first()
        if not deal or user_id not in [deal.agent_id, deal.customer_id]:
            await websocket.close(code=1008)
            return

    room_name = f"negotiation_{deal_id}"
    await manager.connect(user_id, websocket)
    await manager.join_room(room_name, user_id, websocket)

    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            event = payload.get("event")
            data = payload.get("data", {})

            if event == "negotiation:typing":
                is_typing = data.get("is_typing", False)
                await manager.broadcast_to_room(room_name, {
                    "event": "negotiation:typing",
                    "data": {"user_id": user_id, "is_typing": is_typing}
                }, exclude_websocket=websocket)

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        await manager.leave_room(room_name, websocket)


# 3. Live Views count updater
@app.websocket("/ws/listings/{listing_id}")
async def websocket_listing_views_endpoint(websocket: WebSocket, listing_id: int):
    # Public route, no token required
    await websocket.accept()
    room_name = f"listing_views_{listing_id}"
    
    # We join room to receive live updates
    await manager.join_room(room_name, 0, websocket)

    async with SessionLocal() as db:
        # Increment listing views count on connection
        result = await db.execute(select(Listing).filter(Listing.id == listing_id))
        listing = result.scalars().first()
        if listing:
            listing.view_count += 1
            await db.commit()
            await db.refresh(listing)
            
            # Broadcast updated count to everyone in listing room
            await manager.broadcast_to_room(room_name, {
                "event": "listing:view",
                "data": {"listing_id": listing_id, "view_count": listing.view_count}
            })

    try:
        while True:
            # Keep socket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.leave_room(room_name, websocket)
