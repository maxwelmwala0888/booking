from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Room
from app.schemas import RoomOut

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.get("", response_model=list[RoomOut])
async def list_rooms(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Room).where(Room.is_active == True))).scalars().all()