import enum
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Enum, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    AGENT = "AGENT"
    CUSTOMER = "CUSTOMER"
    SELLER = "SELLER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CUSTOMER)
    avatar_url = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    is_online = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_date = Column(DateTime(timezone=True), nullable=True)
    is_pro = Column(Boolean, default=False)
    pro_expires_at = Column(DateTime(timezone=True), nullable=True)
    rating = Column(Float, default=4.8)
    avg_response_time_minutes = Column(Integer, default=15)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listings = relationship("Listing", back_populates="agent", cascade="all, delete-orphan")
    deals_as_customer = relationship("Deal", foreign_keys="[Deal.customer_id]", back_populates="customer")
    deals_as_agent = relationship("Deal", foreign_keys="[Deal.agent_id]", back_populates="agent")
    stage_changes = relationship("DealStageHistory", back_populates="changed_by")
    uploaded_certificates = relationship("LandCertificate", back_populates="uploaded_by")
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")
    offers = relationship("Offer", back_populates="offered_by")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    views = relationship("ListingView", back_populates="viewer")
