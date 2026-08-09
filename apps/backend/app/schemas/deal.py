from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.deal import DealStage
from app.schemas.user import UserResponse
from app.schemas.listing import ListingResponse

class DealStageHistoryResponse(BaseModel):
    id: int
    deal_id: int
    stage: DealStage
    changed_by_id: int
    changed_at: datetime
    note: Optional[str] = None

    class Config:
        from_attributes = True

class DealBase(BaseModel):
    listing_id: int
    customer_id: int
    agent_id: int
    stage: DealStage = DealStage.INQUIRED
    deal_type: str = "SALE"
    final_price: Optional[int] = None
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    buyer_signature: Optional[str] = None
    agent_signature: Optional[str] = None
    seller_signature: Optional[str] = None
    agreement_signed_at: Optional[datetime] = None
    is_verified_closed: bool = False

class DealCreate(BaseModel):
    listing_id: int

class DealStageUpdate(BaseModel):
    stage: DealStage
    note: Optional[str] = None

class DealResponse(DealBase):
    id: int
    created_at: datetime
    updated_at: datetime
    listing: ListingResponse
    customer: UserResponse
    agent: UserResponse
    stage_histories: List[DealStageHistoryResponse] = []

    class Config:
        from_attributes = True
