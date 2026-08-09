from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.offer import OfferStatus

class OfferCreate(BaseModel):
    deal_id: int
    amount: int  # stored in cents
    note: Optional[str] = None

class OfferResponse(BaseModel):
    id: int
    deal_id: int
    offered_by_id: int
    amount: int
    note: Optional[str] = None
    status: OfferStatus
    created_at: datetime

    class Config:
        from_attributes = True
