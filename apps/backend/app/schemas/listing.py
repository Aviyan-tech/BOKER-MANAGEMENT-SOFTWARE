from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.listing import LandType, ListingStatus
from app.schemas.user import UserResponse

class ListingImageBase(BaseModel):
    url: str
    is_cover: bool = False

class ListingImageCreate(ListingImageBase):
    pass

class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int

    class Config:
        from_attributes = True

class LandCertificateBase(BaseModel):
    file_url: str
    verified: bool = False

class LandCertificateCreate(LandCertificateBase):
    pass

class LandCertificateResponse(LandCertificateBase):
    id: int
    listing_id: int
    uploaded_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    title: str
    description: str
    location: str
    lat: float
    lng: float
    area: float
    area_unit: str = "sqft"
    price: int  # in cents
    land_type: LandType

class ListingCreate(ListingBase):
    images: Optional[List[ListingImageCreate]] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    area: Optional[float] = None
    area_unit: Optional[str] = None
    price: Optional[int] = None
    land_type: Optional[LandType] = None
    status: Optional[ListingStatus] = None

class ListingResponse(ListingBase):
    id: int
    status: ListingStatus
    agent_id: int
    view_count: int
    dimensions: Optional[str] = None
    created_at: datetime
    images: List[ListingImageResponse] = []
    agent: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ListingDetailResponse(ListingResponse):
    certificates: List[LandCertificateResponse] = []

class AnalyticsViewsOverTime(BaseModel):
    date: str
    count: int

class AgentAnalytics(BaseModel):
    total_listings: int
    total_views: int
    total_deals: int
    views_over_time: List[AnalyticsViewsOverTime]
