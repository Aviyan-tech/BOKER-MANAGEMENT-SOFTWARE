import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class LandType(str, enum.Enum):
    RESIDENTIAL = "residential"
    AGRICULTURAL = "agricultural"
    COMMERCIAL = "commercial"

class ListingStatus(str, enum.Enum):
    AVAILABLE = "available"
    UNDER_NEGOTIATION = "under negotiation"
    SOLD = "sold"

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    area = Column(Float, nullable=False)
    area_unit = Column(String, nullable=False, default="sqft")
    price = Column(Integer, nullable=False)  # stored in smallest currency unit (e.g. cents)
    land_type = Column(Enum(LandType), nullable=False)
    status = Column(Enum(ListingStatus), nullable=False, default=ListingStatus.AVAILABLE)
    is_approved = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    deal_type = Column(String, nullable=False, default="SALE") # SALE or RENTAL
    dimensions = Column(String, nullable=True) # e.g. '120 ft x 80 ft' or '100m length'
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    agent = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    certificates = relationship("LandCertificate", back_populates="listing", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="listing", cascade="all, delete-orphan")
    views = relationship("ListingView", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    url = Column(String, nullable=False)
    is_cover = Column(Boolean, default=False)

    # Relationships
    listing = relationship("Listing", back_populates="images")


class LandCertificate(Base):
    __tablename__ = "land_certificates"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    file_url = Column(String, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="certificates")
    uploaded_by = relationship("User", back_populates="uploaded_certificates")


class ListingView(Base):
    __tablename__ = "listing_views"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    viewer_ip = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="views")
    viewer = relationship("User", back_populates="views")
