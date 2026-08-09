from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_

from app.core.deps import get_db, get_current_user, is_authenticated
from app.models.user import User, UserRole
from app.models.deal import Deal, DealStage, DealStageHistory
from app.models.offer import Offer, OfferStatus
from app.models.listing import Listing, ListingStatus
from app.schemas.offer import OfferCreate, OfferResponse
from app.ws.connection_manager import manager

router = APIRouter(prefix="/offers", tags=["offers"])

@router.get("", response_model=List[OfferResponse])
async def get_offers(
    deal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    # Verify access to deal
    result = await db.execute(select(Deal).filter(Deal.id == deal_id))
    deal = result.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    if current_user.role != UserRole.ADMIN and current_user.id not in [deal.agent_id, deal.customer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view offers for this deal")
        
    result = await db.execute(
        select(Offer).filter(Offer.deal_id == deal_id).order_by(Offer.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    offer_in: OfferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    # Verify deal access
    result = await db.execute(select(Deal).filter(Deal.id == offer_in.deal_id))
    deal = result.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    if current_user.id not in [deal.agent_id, deal.customer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to make offers in this deal")
        
    if deal.stage == DealStage.CLOSED:
        raise HTTPException(status_code=400, detail="Negotiation is locked. Deal is already closed.")

    # Mark any existing PENDING offers as COUNTERED/REJECTED
    result = await db.execute(
        select(Offer).filter(
            and_(Offer.deal_id == offer_in.deal_id, Offer.status == OfferStatus.PENDING)
        )
    )
    pending_offers = result.scalars().all()
    for po in pending_offers:
        po.status = OfferStatus.COUNTERED

    # Create new offer
    db_offer = Offer(
        deal_id=offer_in.deal_id,
        offered_by_id=current_user.id,
        amount=offer_in.amount,
        note=offer_in.note,
        status=OfferStatus.PENDING
    )
    db.add(db_offer)
    
    # Auto move deal status to Negotiating if not already
    if deal.stage != DealStage.NEGOTIATING:
        deal.stage = DealStage.NEGOTIATING
        history = DealStageHistory(
            deal_id=deal.id,
            stage=DealStage.NEGOTIATING,
            changed_by_id=current_user.id,
            note="Deal automatically moved to Negotiating upon offer submission."
        )
        db.add(history)
        
    await db.commit()
    await db.refresh(db_offer)
    
    # Trigger in-app notification
    from app.ws.connection_manager import create_notification
    opposing_user_id = deal.customer_id if current_user.id == deal.agent_id else deal.agent_id
    await create_notification(
        user_id=opposing_user_id,
        notif_type="new_offer",
        payload={
            "deal_id": deal.id,
            "offered_by_name": current_user.name,
            "amount": offer_in.amount,
            "note": offer_in.note
        },
        db=db
    )
    
    # Broadcast offer event to the WS negotiation room
    room_name = f"negotiation_{offer_in.deal_id}"
    await manager.broadcast_to_room(room_name, {
        "event": "negotiation:offer",
        "data": {
            "id": db_offer.id,
            "deal_id": db_offer.deal_id,
            "offered_by_id": db_offer.offered_by_id,
            "amount": db_offer.amount,
            "note": db_offer.note,
            "status": db_offer.status.value,
            "created_at": db_offer.created_at.isoformat()
        }
    })

    return db_offer

@router.patch("/{id}", response_model=OfferResponse)
async def update_offer_status(
    id: int,
    status_update: str, # "ACCEPTED" or "REJECTED"
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    result = await db.execute(select(Offer).filter(Offer.id == id))
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    result = await db.execute(select(Deal).filter(Deal.id == offer.deal_id))
    deal = result.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if current_user.id not in [deal.agent_id, deal.customer_id]:
        raise HTTPException(status_code=403, detail="Not authorized in this deal")

    if offer.offered_by_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot accept or reject your own offer")

    if offer.status != OfferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Offer is no longer pending")

    if status_update == "ACCEPTED":
        offer.status = OfferStatus.ACCEPTED
        # Auto-close the Deal
        deal.stage = DealStage.CLOSED
        
        # Log to deal history
        history = DealStageHistory(
            deal_id=deal.id,
            stage=DealStage.CLOSED,
            changed_by_id=current_user.id,
            note=f"Offer of ${offer.amount / 100:,.2f} accepted. Deal closed successfully."
        )
        db.add(history)
        
        # Update listing status to SOLD
        result = await db.execute(select(Listing).filter(Listing.id == deal.listing_id))
        listing = result.scalars().first()
        if listing:
            listing.status = ListingStatus.SOLD

    elif status_update == "REJECTED":
        offer.status = OfferStatus.REJECTED
    else:
        raise HTTPException(status_code=400, detail="Invalid status update action")

    await db.commit()
    await db.refresh(offer)

    # Trigger in-app notification
    from app.ws.connection_manager import create_notification
    await create_notification(
        user_id=offer.offered_by_id,
        notif_type="offer_status_changed",
        payload={
            "deal_id": deal.id,
            "offer_id": offer.id,
            "status": offer.status.value,
            "amount": offer.amount
        },
        db=db
    )

    # Broadcast update event to WS room
    room_name = f"negotiation_{offer.deal_id}"
    await manager.broadcast_to_room(room_name, {
        "event": "negotiation:offer-status",
        "data": {
            "id": offer.id,
            "deal_id": offer.deal_id,
            "status": offer.status.value,
            "amount": offer.amount
        }
    })

    return offer
