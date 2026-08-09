from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_

from app.core.deps import get_db, get_current_user, is_authenticated
from app.models.user import User, UserRole
from app.models.listing import Listing
from app.models.deal import Deal, DealStage, DealStageHistory
from app.schemas.deal import DealCreate, DealStageUpdate, DealResponse

router = APIRouter(prefix="/deals", tags=["deals"])

@router.get("", response_model=List[DealResponse])
async def get_deals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    query = select(Deal).options(
        selectinload(Deal.listing).selectinload(Listing.images),
        selectinload(Deal.customer),
        selectinload(Deal.agent),
        selectinload(Deal.stage_histories)
    )

    if current_user.role == UserRole.AGENT:
        query = query.filter(Deal.agent_id == current_user.id)
    elif current_user.role == UserRole.CUSTOMER:
        query = query.filter(Deal.customer_id == current_user.id)
    # Admin gets all deals

    result = await db.execute(query.order_by(Deal.updated_at.desc()))
    return result.scalars().all()

@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(
    deal_in: DealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    # Customer only check (recommended for inquiry flow)
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=400,
            detail="Only customers can initiate a land inquiry / deal."
        )

    # Get listing
    result = await db.execute(select(Listing).filter(Listing.id == deal_in.listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Land listing not found")

    # Check if a deal already exists
    result = await db.execute(
        select(Deal).filter(
            and_(Deal.listing_id == listing.id, Deal.customer_id == current_user.id)
        )
    )
    existing_deal = result.scalars().first()
    if existing_deal:
        # Fetch existing deal with all preloads
        query = select(Deal).options(
            selectinload(Deal.listing).selectinload(Listing.images),
            selectinload(Deal.customer),
            selectinload(Deal.agent),
            selectinload(Deal.stage_histories)
        ).filter(Deal.id == existing_deal.id)
        res = await db.execute(query)
        return res.scalars().first()

    # Create new deal
    db_deal = Deal(
        listing_id=listing.id,
        customer_id=current_user.id,
        agent_id=listing.agent_id,
        stage=DealStage.INQUIRED
    )
    db.add(db_deal)
    await db.commit()
    await db.refresh(db_deal)

    # Log initial stage to history
    history = DealStageHistory(
        deal_id=db_deal.id,
        stage=DealStage.INQUIRED,
        changed_by_id=current_user.id,
        note="Customer initiated land inquiry / created deal room."
    )
    db.add(history)
    await db.commit()

    # Re-fetch deal with relationships loaded
    query = select(Deal).options(
        selectinload(Deal.listing).selectinload(Listing.images),
        selectinload(Deal.customer),
        selectinload(Deal.agent),
        selectinload(Deal.stage_histories)
    ).filter(Deal.id == db_deal.id)
    res = await db.execute(query)
    return res.scalars().first()

@router.get("/{id}", response_model=DealResponse)
async def get_deal(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    query = select(Deal).options(
        selectinload(Deal.listing).selectinload(Listing.images),
        selectinload(Deal.customer),
        selectinload(Deal.agent),
        selectinload(Deal.stage_histories)
    ).filter(Deal.id == id)

    result = await db.execute(query)
    deal = result.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # Access check: user must be agent, customer, or admin on this deal
    if current_user.role != UserRole.ADMIN and current_user.id not in [deal.agent_id, deal.customer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to access this deal")

    return deal

@router.patch("/{id}/stage", response_model=DealResponse)
async def update_deal_stage(
    id: int,
    stage_update: DealStageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    result = await db.execute(select(Deal).filter(Deal.id == id))
    deal = result.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # Authorization: only assigned agent or admin can change the pipeline stage
    if current_user.role != UserRole.ADMIN and deal.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the listing agent can advance the pipeline stages.")

    # Update stage
    deal.stage = stage_update.stage
    
    # Save stage history
    history = DealStageHistory(
        deal_id=deal.id,
        stage=stage_update.stage,
        changed_by_id=current_user.id,
        note=stage_update.note or f"Stage updated to {stage_update.stage.value}"
    )
    db.add(history)
    await db.commit()
    await db.refresh(deal)

    # Trigger in-app notification
    from app.ws.connection_manager import create_notification
    opposing_user_id = deal.customer_id if current_user.id == deal.agent_id else deal.agent_id
    await create_notification(
        user_id=opposing_user_id,
        notif_type="deal_stage_changed",
        payload={
            "deal_id": deal.id,
            "stage": stage_update.stage.value,
            "note": stage_update.note or ""
        },
        db=db
    )

    # Re-fetch deal with relationships loaded
    query = select(Deal).options(
        selectinload(Deal.listing).selectinload(Listing.images),
        selectinload(Deal.customer),
        selectinload(Deal.agent),
        selectinload(Deal.stage_histories)
    ).filter(Deal.id == id)
    res = await db.execute(query)
    return res.scalars().first()
