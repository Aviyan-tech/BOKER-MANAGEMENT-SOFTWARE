import asyncio
from app.db.session import SessionLocal
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.listing import Listing

async def test():
    async with SessionLocal() as db:
        result = await db.execute(
            select(Listing)
            .options(
                selectinload(Listing.images),
                selectinload(Listing.agent),
                selectinload(Listing.certificates)
            )
            .filter(Listing.id == 1)
        )
        l = result.scalars().first()
        if l:
            print("Found:", l.title)
            print("Agent:", l.agent.name if l.agent else "None")
            print("Agent phone:", l.agent.phone_number if l.agent else "N/A")
            print("Images:", len(l.images))
            print("Certs:", len(l.certificates))
        else:
            print("Listing 1 not found in DB")

asyncio.run(test())
