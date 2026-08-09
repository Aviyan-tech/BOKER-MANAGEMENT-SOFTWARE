from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    deal_id: Optional[int] = None

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    deal_id: Optional[int] = None
    content: str
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
