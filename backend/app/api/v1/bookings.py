from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Room, Booking, BookingStatus
from app.schemas import BookingCreate, BookingOut
from typing import List

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.get("/check-availability")
async def check_availability(room_id: int, check_in: str, check_out: str, db: AsyncSession = Depends(get_db)):
    # Check if any non-cancelled booking overlaps with these dates
    overlap = await db.execute(
        select(Booking).where(
            Booking.room_id == room_id,
            Booking.status != BookingStatus.cancelled,
            Booking.check_in < check_out,
            Booking.check_out > check_in
        )
    )
    is_booked = overlap.scalars().first() is not None
    return {"available": not is_booked}

@router.post("", response_model=BookingOut)
async def create_booking(data: BookingCreate, db: AsyncSession = Depends(get_db)):
    room = await db.get(Room, data.room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    
    overlap = await db.execute(
        select(Booking).where(
            Booking.room_id == data.room_id,
            Booking.status != BookingStatus.cancelled,
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in
        )
    )
    if overlap.scalars().first():
        raise HTTPException(status_code=400, detail="This room is already booked for these dates.")

    nights = (data.check_out - data.check_in).days
    b = Booking(
        guest_name=data.guest_name, email=data.email, phone=data.phone, origin=data.origin,
        room_id=data.room_id, check_in=data.check_in, check_out=data.check_out,
        total_price=nights * room.price_per_night, payment_method=data.payment_method
    )
    db.add(b)
    await db.commit()
    await db.refresh(b)
    return b

@router.get("", response_model=List[BookingOut])
async def list_bookings(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Booking).order_by(Booking.created_at.desc()))).scalars().all()

@router.patch("/{booking_id}/status")
async def update_status(booking_id: int, status: BookingStatus, db: AsyncSession = Depends(get_db)):
    b = await db.get(Booking, booking_id)
    if not b: raise HTTPException(404, "Not found")
    b.status = status
    await db.commit()
    return {"ok": True}