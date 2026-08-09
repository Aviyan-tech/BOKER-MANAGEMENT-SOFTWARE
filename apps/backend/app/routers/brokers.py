from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_, or_

from app.core.deps import get_db, is_authenticated, get_current_user
from app.models.user import User, UserRole
from app.models.listing import Listing
from app.models.deal import Deal, DealStage
from app.schemas.user import UserResponse
from app.schemas.deal import DealResponse

router = APIRouter(prefix="/brokers", tags=["brokers"])

def calculate_trust_score(user: User, closed_deals_count: int) -> int:
    score = 50  # Base score
    if user.is_verified:
        score += 20
    if user.is_pro:
        score += 10
    score += min(30, closed_deals_count * 5)
    score += int((user.rating or 4.8) * 4)
    if (user.avg_response_time_minutes or 15) > 30:
        score -= 5
    return max(1, min(100, score))

class LeaderboardEntry(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    is_verified: bool
    is_pro: bool
    rating: float
    avg_response_time_minutes: int
    trust_score: int
    closed_deals_count: int
    total_sales_volume: int  # in paisa/cents
    active_listings_count: int

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    # Fetch all agents
    agents_res = await db.execute(select(User).filter(User.role == UserRole.AGENT))
    agents = agents_res.scalars().all()

    leaderboard = []
    for agent in agents:
        # Count closed deals
        deals_res = await db.execute(
            select(Deal).options(selectinload(Deal.listing)).filter(
                and_(
                    Deal.agent_id == agent.id,
                    or_(Deal.stage == DealStage.CLOSED, Deal.is_verified_closed == True)
                )
            )
        )
        closed_deals = deals_res.scalars().all()
        closed_count = len(closed_deals)
        
        # Calculate volume
        volume = 0
        for d in closed_deals:
            if d.final_price:
                volume += d.final_price
            elif d.listing:
                volume += d.listing.price

        # Active listings count
        listings_res = await db.execute(
            select(func.count(Listing.id)).filter(Listing.agent_id == agent.id)
        )
        active_listings = listings_res.scalar() or 0

        trust_score = calculate_trust_score(agent, closed_count)

        leaderboard.append(LeaderboardEntry(
            id=agent.id,
            name=agent.name,
            email=agent.email,
            avatar_url=agent.avatar_url,
            phone_number=agent.phone_number,
            is_verified=agent.is_verified,
            is_pro=agent.is_pro,
            rating=agent.rating or 4.8,
            avg_response_time_minutes=agent.avg_response_time_minutes or 15,
            trust_score=trust_score,
            closed_deals_count=closed_count,
            total_sales_volume=volume,
            active_listings_count=active_listings
        ))

    # STRICTLY RANKED BY VERIFIED COMPLETED DEALS COUNT (descending)
    leaderboard.sort(key=lambda x: (x.closed_deals_count, x.trust_score), reverse=True)
    return leaderboard


class ClosedDealEntry(BaseModel):
    id: int
    listing_id: int
    title: str
    location: str
    image_url: Optional[str] = None
    deal_type: str  # SALE or RENTAL
    final_price: int  # in paisa/cents
    closed_at: datetime
    agent_id: int
    agent_name: str
    agent_avatar: Optional[str] = None
    agent_is_verified: bool
    agent_is_pro: bool
    agent_trust_score: int
    agent_total_closed_deals: int

@router.get("/closed-deals", response_model=List[ClosedDealEntry])
async def get_closed_deals(db: AsyncSession = Depends(get_db)):
    deals_res = await db.execute(
        select(Deal).options(
            selectinload(Deal.listing).selectinload(Listing.images),
            selectinload(Deal.agent)
        ).filter(
            or_(Deal.stage == DealStage.CLOSED, Deal.is_verified_closed == True)
        ).order_by(Deal.updated_at.desc())
    )
    deals = deals_res.scalars().all()

    closed_entries = []
    for d in deals:
        if not d.listing:
            continue
        
        cover_img = None
        if d.listing.images:
            cover = next((img.url for img in d.listing.images if img.is_cover), d.listing.images[0].url)
            cover_img = cover
        
        # Count agent closed deals
        agent_deals_res = await db.execute(
            select(func.count(Deal.id)).filter(
                and_(
                    Deal.agent_id == d.agent_id,
                    or_(Deal.stage == DealStage.CLOSED, Deal.is_verified_closed == True)
                )
            )
        )
        agent_closed_count = agent_deals_res.scalar() or 0
        trust_score = calculate_trust_score(d.agent, agent_closed_count) if d.agent else 80

        closed_entries.append(ClosedDealEntry(
            id=d.id,
            listing_id=d.listing_id,
            title=d.listing.title,
            location=d.listing.location,
            image_url=cover_img,
            deal_type=d.deal_type or d.listing.deal_type or "SALE",
            final_price=d.final_price or d.listing.price,
            closed_at=d.updated_at or d.created_at,
            agent_id=d.agent_id,
            agent_name=d.agent.name if d.agent else "Verified Agent",
            agent_avatar=d.agent.avatar_url if d.agent else None,
            agent_is_verified=d.agent.is_verified if d.agent else True,
            agent_is_pro=d.agent.is_pro if d.agent else False,
            agent_trust_score=trust_score,
            agent_total_closed_deals=agent_closed_count
        ))

    return closed_entries


@router.post("/verify")
async def verify_agent(
    current_user: User = Depends(is_authenticated),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.AGENT:
        raise HTTPException(status_code=400, detail="Only agents can purchase Verification status.")

    current_user.is_verified = True
    current_user.verification_date = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "Successfully verified agent!",
        "is_verified": True,
        "verification_date": current_user.verification_date
    }


@router.post("/subscribe-pro")
async def subscribe_pro(
    current_user: User = Depends(is_authenticated),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.AGENT:
        raise HTTPException(status_code=400, detail="Only agents can subscribe to Broker Pro.")

    current_user.is_pro = True
    current_user.pro_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    
    # Feature all current agent listings
    listings_res = await db.execute(select(Listing).filter(Listing.agent_id == current_user.id))
    for listing in listings_res.scalars().all():
        listing.is_featured = True

    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "Successfully subscribed to Broker Pro!",
        "is_pro": True,
        "pro_expires_at": current_user.pro_expires_at
    }


class SignAgreementRequest(BaseModel):
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    final_price: Optional[int] = None
    signature_data: str  # Base64 string or typed name
    signer_role: str  # BUYER or AGENT or SELLER

@router.get("/deals/{deal_id}/agreement")
async def get_agreement(
    deal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    deal_res = await db.execute(
        select(Deal).options(
            selectinload(Deal.listing),
            selectinload(Deal.customer),
            selectinload(Deal.agent)
        ).filter(Deal.id == deal_id)
    )
    deal = deal_res.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if current_user.role != UserRole.ADMIN and current_user.id not in [deal.agent_id, deal.customer_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "deal_id": deal.id,
        "property_title": deal.listing.title,
        "property_location": deal.listing.location,
        "property_area": f"{deal.listing.area} {deal.listing.area_unit}",
        "deal_type": deal.deal_type or deal.listing.deal_type or "SALE",
        "asking_price": deal.listing.price,
        "final_price": deal.final_price or deal.listing.price,
        "buyer_name": deal.buyer_name or deal.customer.name,
        "seller_name": deal.seller_name or "Property Owner (Represented by Agent)",
        "agent_name": deal.agent.name,
        "agent_is_verified": deal.agent.is_verified,
        "buyer_signature": deal.buyer_signature,
        "agent_signature": deal.agent_signature,
        "seller_signature": deal.seller_signature,
        "agreement_signed_at": deal.agreement_signed_at,
        "stage": deal.stage
    }


@router.post("/deals/{deal_id}/agreement/sign")
async def sign_agreement(
    deal_id: int,
    req: SignAgreementRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    deal_res = await db.execute(
        select(Deal).options(
            selectinload(Deal.listing),
            selectinload(Deal.customer),
            selectinload(Deal.agent)
        ).filter(Deal.id == deal_id)
    )
    deal = deal_res.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if req.final_price:
        deal.final_price = req.final_price
    if req.buyer_name:
        deal.buyer_name = req.buyer_name
    if req.seller_name:
        deal.seller_name = req.seller_name

    if req.signer_role == "BUYER":
        deal.buyer_signature = req.signature_data
    elif req.signer_role == "AGENT":
        deal.agent_signature = req.signature_data
    elif req.signer_role == "SELLER":
        deal.seller_signature = req.signature_data

    deal.agreement_signed_at = datetime.now(timezone.utc)
    
    # If signed by both buyer and agent, mark stage CLOSED and verified closed
    if deal.buyer_signature and deal.agent_signature:
        deal.stage = DealStage.CLOSED
        deal.is_verified_closed = True
        deal.listing.status = "sold"

    await db.commit()
    await db.refresh(deal)

    return {
        "message": "Agreement signed successfully!",
        "deal_id": deal.id,
        "buyer_signature": deal.buyer_signature,
        "agent_signature": deal.agent_signature,
        "agreement_signed_at": deal.agreement_signed_at,
        "stage": deal.stage
    }
