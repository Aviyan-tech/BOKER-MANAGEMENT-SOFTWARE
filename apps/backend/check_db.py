import asyncio
from app.db.session import SessionLocal
from sqlalchemy.future import select
from app.models.listing import Listing
from app.models.user import User

async def check():
    async with SessionLocal() as db:
        users = (await db.execute(select(User))).scalars().all()
        listings = (await db.execute(select(Listing))).scalars().all()
        print(f"Users in DB: {len(users)}")
        for u in users:
            print(f"  - {u.email} | phone: {u.phone_number}")
        print(f"Listings in DB: {len(listings)}")
        for l in listings:
            print(f"  - [{l.id}] {l.title} | approved={l.is_approved} | status={l.status} | price={l.price}")

asyncio.run(check())
