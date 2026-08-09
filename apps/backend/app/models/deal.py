import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class DealStage(str, enum.Enum):
    INQUIRED = "Inquired"
    SITE_VISIT_SCHEDULED = "Site Visit Scheduled"
    NEGOTIATING = "Negotiating"
    CLOSED = "Closed"

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stage = Column(Enum(DealStage), nullable=False, default=DealStage.INQUIRED)
    deal_type = Column(String, nullable=False, default="SALE") # SALE or RENTAL
    final_price = Column(Integer, nullable=True) # in cents/paisa
    buyer_name = Column(String, nullable=True)
    seller_name = Column(String, nullable=True)
    buyer_signature = Column(String, nullable=True)
    agent_signature = Column(String, nullable=True)
    seller_signature = Column(String, nullable=True)
    agreement_signed_at = Column(DateTime(timezone=True), nullable=True)
    is_verified_closed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="deals")
    customer = relationship("User", foreign_keys=[customer_id], back_populates="deals_as_customer")
    agent = relationship("User", foreign_keys=[agent_id], back_populates="deals_as_agent")
    stage_histories = relationship("DealStageHistory", back_populates="deal", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="deal", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="deal", cascade="all, delete-orphan")


class DealStageHistory(Base):
    __tablename__ = "deal_stage_histories"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    stage = Column(Enum(DealStage), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(String, nullable=True)

    # Relationships
    deal = relationship("Deal", back_populates="stage_histories")
    changed_by = relationship("User", back_populates="stage_changes")
