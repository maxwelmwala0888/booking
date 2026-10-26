import asyncio
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models import Room

async def main():
    async with SessionLocal() as db:
        existing = (await db.execute(select(Room))).scalars().all()
        for r in existing:
            await db.delete(r)
        await db.commit()

        rooms = [
            Room(name="Presidential Suite", description="World-class luxury with panoramic views and private butler service.", price_per_night=4000, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182060.jpg?k=35076c8b4bca53cf772b010d7b135442c2baf37eb91e016b8886840c4c268d5b&o="),
            Room(name="Deluxe Twin", description="Perfect for families or colleagues, featuring two plush queen beds.", price_per_night=600, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182035.jpg?k=c2ab1df6d69cd68928938174e093d3c1ed5f39132073f9079c91e196434f9c65&o="),
            Room(name="Executive Suite", description="Designed for business travelers with a dedicated workspace and lounge area.", price_per_night=2500, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929179883.jpg?k=ab21ae2a921eb4456e8593cdb2aebf1b27e8adf5907edb9fdaa4f4404f91d7bf&o="),
            Room(name="Family Suite", description="Spacious layout with a master bedroom and separate living area for kids.", price_per_night=1200, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929179883.jpg?k=ab21ae2a921eb4456e8593cdb2aebf1b27e8adf5907edb9fdaa4f4404f91d7bf&o="),
            Room(name="Honeymoon Suite", description="Romantic atmosphere with a king-size bed, champagne on arrival, and a jacuzzi.", price_per_night=1800, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182072.jpg?k=669f0337ec1990a04056ea5bca07b24053d57950bb73bcc4eab3649f70c73a86&o="),
            Room(name="Standard Room", description="Cozy and affordable comfort, ideal for short stays.", price_per_night=300, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182084.jpg?k=d3b5a1b53c5d56357f24fb19001ad26632ba559fc175860f96717a236c0b458e&o=")
        ]
        db.add_all(rooms)
        await db.commit()
    print("Seeded with updated Family Suite image")

asyncio.run(main())