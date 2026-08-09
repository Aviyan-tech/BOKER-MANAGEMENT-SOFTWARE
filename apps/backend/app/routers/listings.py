import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_, or_

from app.core.config import settings
from app.core.deps import get_db, get_current_user, get_current_user_optional, is_agent, is_authenticated, is_agent_or_admin
from app.models.user import User, UserRole
from app.models.listing import Listing, ListingImage, LandCertificate, ListingStatus, LandType, ListingView
from app.models.deal import Deal
from app.schemas.listing import ListingCreate, ListingResponse, ListingDetailResponse, ListingUpdate, LandCertificateResponse, ListingImageResponse
from app.schemas.user import UserResponse
from datetime import datetime

router = APIRouter(prefix="/listings", tags=["listings"])

# Helper to verify if user has access to certificates
async def has_certificate_access(user: User, listing: Listing, db: AsyncSession) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    if user.role == UserRole.AGENT and listing.agent_id == user.id:
        return True
    if user.role == UserRole.CUSTOMER:
        # Check if customer has an active deal/inquiry for this listing
        result = await db.execute(
            select(Deal).filter(and_(Deal.listing_id == listing.id, Deal.customer_id == user.id))
        )
        deal = result.scalars().first()
        if deal:
            return True
    return False

@router.get("", response_model=List[ListingResponse])
async def get_listings(
    location: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    area_min: Optional[float] = None,
    area_max: Optional[float] = None,
    land_type: Optional[LandType] = None,
    status: Optional[ListingStatus] = None,
    only_approved: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(Listing).options(
        selectinload(Listing.images),
        selectinload(Listing.agent)
    )
    
    filters = []
    
    # Enforce only_approved = True for non-agents/non-admins
    if not only_approved:
        if not current_user or current_user.role not in [UserRole.AGENT, UserRole.ADMIN]:
            only_approved = True

    if only_approved:
        filters.append(Listing.is_approved == True)
        
    if location:
        filters.append(Listing.location.ilike(f"%{location}%"))
    if price_min is not None:
        filters.append(Listing.price >= price_min)
    if price_max is not None:
        filters.append(Listing.price <= price_max)
    if area_min is not None:
        filters.append(Listing.area >= area_min)
    if area_max is not None:
        filters.append(Listing.area <= area_max)
    if land_type:
        filters.append(Listing.land_type == land_type)
    if status:
        filters.append(Listing.status == status)
    else:
        # By default, show available and negotiating listings
        filters.append(Listing.status != ListingStatus.SOLD)
        
    if filters:
        query = query.filter(and_(*filters))
        
    result = await db.execute(query.order_by(Listing.is_featured.desc(), Listing.created_at.desc()))
    return result.scalars().all()

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(is_agent),
    db: AsyncSession = Depends(get_db)
):
    db_listing = Listing(
        title=listing_in.title,
        description=listing_in.description,
        location=listing_in.location,
        lat=listing_in.lat,
        lng=listing_in.lng,
        area=listing_in.area,
        area_unit=listing_in.area_unit,
        price=listing_in.price,
        land_type=listing_in.land_type,
        status=ListingStatus.AVAILABLE,
        agent_id=current_user.id
    )
    
    db.add(db_listing)
    await db.commit()
    await db.refresh(db_listing)
    
    # Save initial images if any
    if listing_in.images:
        for img in listing_in.images:
            db_img = ListingImage(
                listing_id=db_listing.id,
                url=img.url,
                is_cover=img.is_cover
            )
            db.add(db_img)
        await db.commit()
        
    # Re-fetch with relationships loaded
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.images), selectinload(Listing.agent))
        .filter(Listing.id == db_listing.id)
    )
    return result.scalars().first()

@router.get("/{id}", response_model=ListingDetailResponse)
async def get_listing(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(Listing).options(
        selectinload(Listing.images),
        selectinload(Listing.agent),
        selectinload(Listing.certificates)
    ).filter(Listing.id == id)
    
    result = await db.execute(query)
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Record view increment
    listing.view_count += 1
    
    # Track view analytics
    view_log = ListingView(
        listing_id=listing.id,
        user_id=current_user.id if current_user else None
    )
    db.add(view_log)
    await db.commit()
    
    # Convert to detail schema, filter out certificates if unauthorized
    has_access = False
    if current_user:
        has_access = await has_certificate_access(current_user, listing, db)
        
    certificates_res = []
    if has_access:
        certificates_res = [
            LandCertificateResponse(
                id=c.id,
                listing_id=c.listing_id,
                file_url=c.file_url,
                uploaded_by_id=c.uploaded_by_id,
                verified=c.verified,
                created_at=c.created_at
            ) for c in listing.certificates
        ]
        
    return ListingDetailResponse(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        location=listing.location,
        lat=listing.lat,
        lng=listing.lng,
        area=listing.area,
        area_unit=listing.area_unit,
        price=listing.price,
        land_type=listing.land_type,
        status=listing.status,
        agent_id=listing.agent_id,
        view_count=listing.view_count,
        created_at=listing.created_at,
        images=[ListingImageResponse.model_validate(img) for img in listing.images],
        agent=UserResponse.model_validate(listing.agent),
        certificates=certificates_res
    )

@router.patch("/{id}", response_model=ListingResponse)
async def update_listing(
    id: int,
    listing_update: ListingUpdate,
    current_user: User = Depends(is_agent_or_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Listing).filter(Listing.id == id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if current_user.role != UserRole.ADMIN and listing.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")
        
    for key, value in listing_update.dict(exclude_unset=True).items():
        setattr(listing, key, value)
        
    await db.commit()
    await db.refresh(listing)
    
    # Return with images and agent preloaded
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.images), selectinload(Listing.agent))
        .filter(Listing.id == id)
    )
    return result.scalars().first()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    id: int,
    current_user: User = Depends(is_agent_or_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Listing).filter(Listing.id == id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if current_user.role != UserRole.ADMIN and listing.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        
    await db.delete(listing)
    await db.commit()
    return None

# Static / Dynamic Image Upload
@router.post("/{id}/images", response_model=ListingResponse)
async def upload_listing_image(
    id: int,
    file: UploadFile = File(...),
    is_cover: bool = Form(False),
    current_user: User = Depends(is_agent),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Listing).filter(Listing.id == id))
    listing = result.scalars().first()
    if not listing or listing.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add images to this listing")
        
    # Save file locally
    images_dir = os.path.join(settings.UPLOADS_DIR, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"listing_{id}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = os.path.join(images_dir, filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # Add to DB
    web_url = f"/uploads/images/{filename}"
    db_img = ListingImage(
        listing_id=id,
        url=web_url,
        is_cover=is_cover
    )
    db.add(db_img)
    await db.commit()
    
    # Reload and return
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.images), selectinload(Listing.agent))
        .filter(Listing.id == id)
    )
    return result.scalars().first()

# Certificates Upload (Securely stored in root of uploads dir, not public)
@router.post("/{id}/certificates", response_model=LandCertificateResponse)
async def upload_certificate(
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(is_agent),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Listing).filter(Listing.id == id))
    listing = result.scalars().first()
    if not listing or listing.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add certificates to this listing")
        
    # Save file in secure uploads dir
    certs_dir = os.path.join(settings.UPLOADS_DIR, "certificates")
    os.makedirs(certs_dir, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"cert_{id}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = os.path.join(certs_dir, filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # Add certificate to DB
    # The fileUrl contains the authenticated API download endpoint URL
    db_cert = LandCertificate(
        listing_id=id,
        file_url=f"/api/v1/listings/{id}/certificates/download/{filename}",
        uploaded_by_id=current_user.id,
        verified=False
    )
    db.add(db_cert)
    await db.commit()
    await db.refresh(db_cert)
    return db_cert

# Secure download route
@router.get("/{id}/certificates/download/{filename}")
async def download_certificate(
    id: int,
    filename: str,
    current_user: User = Depends(is_authenticated),
    db: AsyncSession = Depends(get_db)
):
    # Verify authorization
    result = await db.execute(
        select(Listing).options(selectinload(Listing.certificates)).filter(Listing.id == id)
    )
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Verify if user has access to certificates
    has_access = await has_certificate_access(current_user, listing, db)
    if not has_access:
        raise HTTPException(status_code=403, detail="You do not have permission to view this land certificate.")
        
    file_path = os.path.join(settings.UPLOADS_DIR, "certificates", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Certificate file not found")
        
    return FileResponse(file_path, media_type="application/pdf" if filename.endswith(".pdf") else "image/*")
