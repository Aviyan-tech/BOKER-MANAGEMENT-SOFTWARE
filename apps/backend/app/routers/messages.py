from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_

from app.core.deps import get_db, get_current_user, is_authenticated
from app.models.user import User, UserRole
from app.models.message import Message
from app.schemas.message import MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("", response_model=List[MessageResponse])
async def get_messages(
    deal_id: Optional[int] = None,
    with_user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    if deal_id is not None:
        # Deal / Customer-Agent chat: scoped to the deal
        query = select(Message).filter(Message.deal_id == deal_id)
    elif with_user_id is not None:
        # Direct Agent-to-Agent chat: sender/receiver is current_user and with_user_id
        # Scoped where deal_id is NULL
        query = select(Message).filter(
            and_(
                Message.deal_id.is_(None),
                or_(
                    and_(Message.sender_id == current_user.id, Message.receiver_id == with_user_id),
                    and_(Message.sender_id == with_user_id, Message.receiver_id == current_user.id)
                )
            )
        )
    else:
        raise HTTPException(status_code=400, detail="Either deal_id or with_user_id must be provided")

    result = await db.execute(query.order_by(Message.created_at.asc()))
    return result.scalars().all()
