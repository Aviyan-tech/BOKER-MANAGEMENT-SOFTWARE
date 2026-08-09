from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.core.deps import get_db, is_admin, is_authenticated
from app.models.user import User, UserRole
from app.models.listing import Listing, ListingStatus
from app.models.deal import Deal
from app.schemas.user import UserResponse
from app.schemas.listing import ListingResponse

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/agents", response_model=List[UserResponse])
async def list_agents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_authenticated)
):
    # Visible to all authenticated users so agents/customers can chat with agents
    result = await db.execute(select(User).filter(User.role == UserRole.AGENT))
    return result.scalars().all()

@router.patch("/listings/{id}/approve", response_model=ListingResponse)
async def approve_listing(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    result = await db.execute(select(Listing).filter(Listing.id == id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    listing.is_approved = True
    await db.commit()
    await db.refresh(listing)
    
    # Reload relationships
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.images), selectinload(Listing.agent))
        .filter(Listing.id == id)
    )
    return result.scalars().first()

@router.get("/unapproved-listings", response_model=List[ListingResponse])
async def get_unapproved_listings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.images), selectinload(Listing.agent))
        .filter(Listing.is_approved == False)
    )
    return result.scalars().all()

@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    # Calculate key metrics
    listings_count = await db.execute(select(func.count(Listing.id)))
    deals_count = await db.execute(select(func.count(Deal.id)))
    users_count = await db.execute(select(func.count(User.id)))
    
    # Calculate total views
    views_sum = await db.execute(select(func.sum(Listing.view_count)))
    total_views = views_sum.scalar() or 0

    return {
        "total_listings": listings_count.scalar() or 0,
        "total_deals": deals_count.scalar() or 0,
        "total_users": users_count.scalar() or 0,
        "total_views": total_views,
    }
