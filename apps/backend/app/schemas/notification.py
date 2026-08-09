from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    payload: Dict[str, Any]
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
