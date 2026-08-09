import asyncio
from app.db.session import engine, SessionLocal
from app.models.user import User, UserRole
from app.models.listing import Listing, LandType, ListingStatus, ListingImage, LandCertificate
from app.core.security import get_password_hash
from sqlalchemy.future import select

from app.db.base import Base

async def seed_data():
    print("Recreating database tables with updated schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    print("Starting database seeding...")
    async with SessionLocal() as db:

        print("Seeding Users...")
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

        agent1 = User(
            name="Ram Bahadur Thapa",
            email="agent@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.AGENT,
            avatar_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=faces",
            phone_number="+977-9841234567",
            is_online=True,
            is_verified=True,
            is_pro=True,
            rating=4.9,
            avg_response_time_minutes=8
        )

        agent2 = User(
            name="Sita Sharma",
            email="sita.agent@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.AGENT,
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces",
            phone_number="+977-9801234567",
            is_online=True,
            is_verified=True,
            is_pro=False,
            rating=4.8,
            avg_response_time_minutes=15
        )

        agent3 = User(
            name="Bikash Karki",
            email="bikash.agent@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.AGENT,
            avatar_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces",
            phone_number="+977-9811223344",
            is_online=False,
            is_verified=False,
            is_pro=False,
            rating=4.6,
            avg_response_time_minutes=25
        )

        customer = User(
            name="Anil Shrestha",
            email="customer@terraflow.com",
            password_hash=pwd_hash,
            role=UserRole.CUSTOMER,
            avatar_url="https://api.dicebear.com/7.x/adventurer/svg?seed=Anil",
            phone_number="+977-9807654321",
            is_online=False
        )

        db.add(admin)
        db.add(agent1)
        db.add(agent2)
        db.add(agent3)
        db.add(customer)
        await db.commit()
        await db.refresh(agent1)
        await db.refresh(agent2)
        await db.refresh(agent3)

        print("Seeding Nepal Land Listings...")

        # --- Listing 1: Pokhara Lakeside Residential ---
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
            price=750000000,   # NPR 75,00,000 (75 lakh)
            land_type=LandType.RESIDENTIAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,
            is_featured=True,
            agent_id=agent1.id,
            dimensions="120 ft x 80 ft"
        )

        # --- Listing 2: Pokhara Commercial Highway Land ---
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
            price=1200000000,  # NPR 1,20,00,000 (1 crore 20 lakh)
            land_type=LandType.COMMERCIAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,
            is_featured=True,
            agent_id=agent2.id,
            dimensions="200 ft x 150 ft"
        )

        # --- Listing 3: Kathmandu Agricultural Farmland ---
        listing3 = Listing(
            title="Kathmandu Valley Fertile Farmland",
            description=(
                "Large fertile agricultural land located in the outskirts of Kathmandu Valley near Bhaktapur. "
                "Highly productive black soil ideal for vegetable farming, organic crops, and agri-tourism. "
                "Permanent irrigation channel runs through the property with seasonal stream access. "
                "Road access available via gravel road upgradeable to asphalt. "
                "Lalpurja and field book documents complete. Great investment opportunity."
            ),
            location="Suryabinayak, Bhaktapur, Bagmati Province",
            lat=27.6710,
            lng=85.4298,
            area=25.0,
            area_unit="ropani",
            price=500000000,   # NPR 50,00,000 (50 lakh)
            land_type=LandType.AGRICULTURAL,
            status=ListingStatus.AVAILABLE,
            is_approved=True,
            is_featured=False,
            agent_id=agent3.id,
            dimensions="300 ft x 400 ft"
        )

        # --- Listing 4: Pokhara Hill View Plot (pending approval example) ---
        listing4 = Listing(
            title="Sarangkot Hill View Residential Land",
            description=(
                "Breathtaking hilltop residential land at Sarangkot, the world-famous paragliding and sunrise viewpoint above Pokhara. "
                "Panoramic 270-degree views of the Annapurna and Dhaulagiri mountain ranges. "
                "Accessible via Sarangkot Road with jeep-accessible path to the plot. "
                "Electricity pole installed. Spring water source on the land. "
                "Perfect for eco-resort, luxury villa, or meditation retreat center."
            ),
            location="Sarangkot, Pokhara, Gandaki Province",
            lat=28.2380,
            lng=83.9370,
            area=16.0,
            area_unit="aana",
            price=960000000,   # NPR 96,00,000 (96 lakh)
            land_type=LandType.RESIDENTIAL,
            status=ListingStatus.AVAILABLE,
            is_approved=False,  # Pending admin approval
            agent_id=agent1.id,
            dimensions="160 ft x 100 ft"
        )

        db.add(listing1)
        db.add(listing2)
        db.add(listing3)
        db.add(listing4)
        await db.commit()
        await db.refresh(listing1)
        await db.refresh(listing2)
        await db.refresh(listing3)
        await db.refresh(listing4)

        print("Seeding Listing Images...")

        # Pokhara Lakeside - beautiful lake + mountains
        db.add(ListingImage(
            listing_id=listing1.id,
            url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
            is_cover=True
        ))
        db.add(ListingImage(
            listing_id=listing1.id,
            url="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop",
            is_cover=False
        ))

        # Pokhara Highway Commercial - highway road land
        db.add(ListingImage(
            listing_id=listing2.id,
            url="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop",
            is_cover=True
        ))

        # Kathmandu Farmland - green agricultural fields
        db.add(ListingImage(
            listing_id=listing3.id,
            url="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop",
            is_cover=True
        ))

        # Sarangkot Hill View - mountain view land
        db.add(ListingImage(
            listing_id=listing4.id,
            url="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop",
            is_cover=True
        ))

        print("Seeding Land Certificates...")
        db.add(LandCertificate(
            listing_id=listing1.id,
            file_url="/api/v1/listings/1/certificates/download/lalpurja_lakeside.pdf",
            uploaded_by_id=agent1.id,
            verified=True
        ))
        db.add(LandCertificate(
            listing_id=listing2.id,
            file_url="/api/v1/listings/2/certificates/download/lalpurja_highway.pdf",
            uploaded_by_id=agent2.id,
            verified=True
        ))

        print("Seeding Verified Closed Deals for Leaderboard & Showcase...")
        from app.models.deal import Deal, DealStage
        
        # Closed deal 1 for agent1 (Ram Bahadur Thapa)
        deal1 = Deal(
            listing_id=listing1.id,
            customer_id=customer.id,
            agent_id=agent1.id,
            stage=DealStage.CLOSED,
            deal_type="SALE",
            final_price=740000000,
            buyer_name="Hari Shrestha",
            seller_name="Kedar Prasad",
            buyer_signature="Digitally Signed by Hari Shrestha",
            agent_signature="Digitally Signed by Ram Bahadur Thapa",
            is_verified_closed=True
        )

        # Closed deal 2 for agent1 (Ram Bahadur Thapa)
        deal2 = Deal(
            listing_id=listing2.id,
            customer_id=customer.id,
            agent_id=agent1.id,
            stage=DealStage.CLOSED,
            deal_type="SALE",
            final_price=1180000000,
            buyer_name="Rajesh Hamal",
            seller_name="Devendra Thapa",
            buyer_signature="Digitally Signed by Rajesh Hamal",
            agent_signature="Digitally Signed by Ram Bahadur Thapa",
            is_verified_closed=True
        )

        # Closed deal 3 for agent1 (Ram Bahadur Thapa)
        deal3 = Deal(
            listing_id=listing3.id,
            customer_id=customer.id,
            agent_id=agent1.id,
            stage=DealStage.CLOSED,
            deal_type="RENTAL",
            final_price=15000000,
            buyer_name="Green Agro Pvt Ltd",
            seller_name="Bhakta Shrestha",
            buyer_signature="Digitally Signed by Green Agro",
            agent_signature="Digitally Signed by Ram Bahadur Thapa",
            is_verified_closed=True
        )

        # Closed deal 4 for agent2 (Sita Sharma)
        deal4 = Deal(
            listing_id=listing3.id,
            customer_id=customer.id,
            agent_id=agent2.id,
            stage=DealStage.CLOSED,
            deal_type="SALE",
            final_price=490000000,
            buyer_name="Sunita Poudel",
            seller_name="Ramesh Baniya",
            buyer_signature="Digitally Signed by Sunita Poudel",
            agent_signature="Digitally Signed by Sita Sharma",
            is_verified_closed=True
        )

        db.add(deal1)
        db.add(deal2)
        db.add(deal3)
        db.add(deal4)

        await db.commit()
        print("=" * 50)
        print("Database successfully seeded with Verified Brokers & Closed Deals!")
        print("=" * 50)
        print("Test Accounts (password: 'password'):")
        print("  Admin    -> admin@terraflow.com")
        print("  Agent    -> agent@terraflow.com    | +977-9841234567")
        print("  Customer -> customer@terraflow.com | +977-9807654321")
        print("=" * 50)
        print("Listings Created:")
        print("  1. Pokhara Lakeside Residential Plot    - NPR 75,00,000  [APPROVED]")
        print("  2. Pokhara-Baglung Highway Commercial   - NPR 1,20,00,000 [APPROVED]")
        print("  3. Kathmandu Valley Fertile Farmland    - NPR 50,00,000  [APPROVED]")
        print("  4. Sarangkot Hill View Residential Land - NPR 96,00,000  [PENDING APPROVAL]")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(seed_data())
