from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app import models
from sqlalchemy import select

app = FastAPI(title="Capital Suit Lodge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
def health():
    return {"ok": True}

# --- AUTO SEED ON STARTUP ---
@app.on_event("startup")
async def startup_event():
    # 1. Create Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Seed Rooms if empty
    async with SessionLocal() as db:
        existing = (await db.execute(select(models.Room))).scalars().first()
        if not existing:
            rooms = [
                models.Room(name="Presidential Suite", description="World-class luxury with panoramic views.", price_per_night=4000, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182060.jpg?k=35076c8b4bca53cf772b010d7b135442c2baf37eb91e016b8886840c4c268d5b&o="),
                models.Room(name="Deluxe Twin", description="Perfect for families or colleagues.", price_per_night=600, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182035.jpg?k=c2ab1df6d69cd68928938174e093d3c1ed5f39132073f9079c91e196434f9c65&o="),
                models.Room(name="Executive Suite", description="Designed for business travelers.", price_per_night=2500, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929179883.jpg?k=ab21ae2a921eb4456e8593cdb2aebf1b27e8adf5907edb9fdaa4f4404f91d7bf&o="),
                models.Room(name="Family Suite", description="Spacious layout with a master bedroom.", price_per_night=1200, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929179883.jpg?k=ab21ae2a921eb4456e8593cdb2aebf1b27e8adf5907edb9fdaa4f4404f91d7bf&o="),
                models.Room(name="Honeymoon Suite", description="Romantic atmosphere with a king-size bed.", price_per_night=1800, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182072.jpg?k=669f0337ec1990a04056ea5bca07b24053d57950bb73bcc4eab3649f70c73a86&o="),
                models.Room(name="Standard Room", description="Cozy and affordable comfort.", price_per_night=300, image_url="https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182084.jpg?k=d3b5a1b53c5d56357f24fb19001ad26632ba559fc175860f96717a236c0b458e&o=")
            ]
            db.add_all(rooms)
            await db.commit()
            print("Database seeded automatically!")