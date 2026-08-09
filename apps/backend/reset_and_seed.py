"""
Reset DB: drops all tables, recreates from current models, then seeds data.
Run from apps/backend directory: python reset_and_seed.py
"""
import asyncio
import os
import sys

# Make sure app is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import engine, SessionLocal
from app.db.base import Base

# Import ALL models so Base.metadata knows about them
from app.models.user import User, UserRole
from app.models.listing import Listing, LandType, ListingStatus, ListingImage, LandCertificate, ListingView
from app.models.deal import Deal, DealStage, DealStageHistory
from app.models.message import Message
from app.models.offer import Offer, OfferStatus
from app.models.notification import Notification

from app.core.security import get_password_hash
from sqlalchemy.future import select


async def reset_db():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("Creating all tables from models...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")


async def seed_data():
    async with SessionLocal() as db:
        print("\nSeeding Users...")
        pwd_hash = get_password_hash("password")

        admin = User(
            name="Admin User",
            email="admin@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.ADMIN,
            avatar_url="https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
            phone_number="+977-01-4567890",
            is_online=False
        )
        agent = User(
            name="Ram Bahadur Thapa",
            email="agent@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.AGENT,
            avatar_url="https://api.dicebear.com/7.x/adventurer/svg?seed=Ram",
            phone_number="+977-9841234567",
            is_online=False
        )
        customer = User(
            name="Sita Sharma",
            email="customer@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.CUSTOMER,
            avatar_url="https://api.dicebear.com/7.x/adventurer/svg?seed=Sita",
            phone_number="+977-9807654321",
            is_online=False
        )

        db.add_all([admin, agent, customer])
        await db.commit()
        await db.refresh(agent)

        print("Seeding Listings...")

        listing1 = Listing(
            title="Pokhara Lakeside Residential Plot",
            description=(
                "Prime residential land located just 5 minutes walk from the iconic Phewa Lake in Pokhara. "
                "Stunning Annapurna mountain range views directly from the plot. "
                "The land is fully fenced, road-accessible, and has electricity and water connections ready. "
                "Ideal for building a boutique hotel, homestay, or private villa. "
                "All land ownership documents (Lalpurja) are clear and verified."
            ),
            location="Lakeside, Pokhara, Gandaki Province",
            lat=28.2096,
            lng=83.9556,
            area=8.0,
            area_unit="aana",
            price=7500000,   # NPR 75,000 stored as paisa (75000 * 100)
            land_type=LandType.RESIDENTIAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,
            agent_id=agent.id,
            dimensions="120 ft x 80 ft"
        )

        listing2 = Listing(
            title="Pokhara-Baglung Highway Commercial Land",
            description=(
                "High-visibility commercial plot situated directly on the Pokhara-Baglung Highway. "
                "Heavy daily traffic flow with excellent frontage exposure. "
                "Perfect for petrol station, showroom, shopping complex, or restaurant chain. "
                "Municipal water supply and three-phase electricity available. "
                "Surrounded by growing commercial establishments. Negotiable price."
            ),
            location="Hemja, Pokhara-Baglung Highway, Kaski",
            lat=28.2674,
            lng=83.9720,
            area=12.0,
            area_unit="aana",
            price=12000000,  # NPR 1,20,000
            land_type=LandType.COMMERCIAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,
            agent_id=agent.id,
            dimensions="200 ft x 150 ft"
        )

        listing3 = Listing(
            title="Kathmandu Valley Fertile Farmland",
            description=(
                "Large fertile agricultural land located in the outskirts of Kathmandu Valley near Bhaktapur. "
                "Highly productive black soil ideal for vegetable farming, organic crops, and agri-tourism. "
                "Permanent irrigation channel runs through the property with seasonal stream access. "
                "Road access available via gravel road. "
                "Lalpurja and field book documents complete. Great investment opportunity."
            ),
            location="Suryabinayak, Bhaktapur, Bagmati Province",
            lat=27.6710,
            lng=85.4298,
            area=25.0,
            area_unit="ropani",
            price=5000000,   # NPR 50,000
            land_type=LandType.AGRICULTURAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,
            agent_id=agent.id,
            dimensions="300 ft x 400 ft"
        )

        listing4 = Listing(
            title="Sarangkot Hill View Residential Land",
            description=(
                "Breathtaking hilltop residential land at Sarangkot, the world-famous paragliding and sunrise "
                "viewpoint above Pokhara. Panoramic 270-degree views of the Annapurna and Dhaulagiri ranges. "
                "Accessible via Sarangkot Road. Electricity pole installed. Spring water source on the land. "
                "Perfect for eco-resort, luxury villa, or meditation retreat center."
            ),
            location="Sarangkot, Pokhara, Gandaki Province",
            lat=28.2380,
            lng=83.9370,
            area=16.0,
            area_unit="aana",
            price=9600000,   # NPR 96,000
            land_type=LandType.RESIDENTIAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,   # approved so it shows up
            agent_id=agent.id,
            dimensions="160 ft x 100 ft"
        )

        db.add_all([listing1, listing2, listing3, listing4])
        await db.commit()
        for l in [listing1, listing2, listing3, listing4]:
            await db.refresh(l)

        print("Seeding Images...")
        images = [
            # Listing 1 - Pokhara Lakeside
            ListingImage(listing_id=listing1.id, url="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop", is_cover=True),
            ListingImage(listing_id=listing1.id, url="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop", is_cover=False),
            ListingImage(listing_id=listing1.id, url="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop", is_cover=False),
            # Listing 2 - Highway Commercial
            ListingImage(listing_id=listing2.id, url="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop", is_cover=True),
            ListingImage(listing_id=listing2.id, url="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop", is_cover=False),
            # Listing 3 - Kathmandu Farmland
            ListingImage(listing_id=listing3.id, url="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop", is_cover=True),
            ListingImage(listing_id=listing3.id, url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop", is_cover=False),
            # Listing 4 - Sarangkot Hill
            ListingImage(listing_id=listing4.id, url="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop", is_cover=True),
            ListingImage(listing_id=listing4.id, url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop", is_cover=False),
        ]
        db.add_all(images)

        print("Seeding Certificates...")
        certs = [
            LandCertificate(listing_id=listing1.id, file_url="/api/v1/listings/1/certificates/download/lalpurja_lakeside.pdf", uploaded_by_id=agent.id, verified=True),
            LandCertificate(listing_id=listing2.id, file_url="/api/v1/listings/2/certificates/download/lalpurja_highway.pdf", uploaded_by_id=agent.id, verified=True),
        ]
        db.add_all(certs)

        await db.commit()

    print("\n" + "="*55)
    print("  Database reset and seeded successfully!")
    print("="*55)
    print("  Test Accounts (password: 'password')")
    print("  Admin    -> admin@terraflow.com")
    print("  Agent    -> agent@terraflow.com    | +977-9841234567")
    print("  Customer -> customer@terraflow.com | +977-9807654321")
    print("="*55)
    print("  Listings (all APPROVED):")
    print("  1. Pokhara Lakeside Residential Plot")
    print("  2. Pokhara-Baglung Highway Commercial Land")
    print("  3. Kathmandu Valley Fertile Farmland")
    print("  4. Sarangkot Hill View Residential Land")
    print("="*55)


async def main():
    await reset_db()
    await seed_data()

if __name__ == "__main__":
    asyncio.run(main())
