from datetime import datetime, date
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models import Role, BookingStatus

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    role: Role

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str
    price_per_night: float
    image_url: str
    is_active: bool

class BookingCreate(BaseModel):
    guest_name: str
    email: EmailStr
    phone: str
    origin: str
    room_id: int
    check_in: date
    check_out: date
    payment_method: str

class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    guest_name: str
    email: EmailStr
    phone: str
    origin: str
    room_id: int
    check_in: date
    check_out: date
    total_price: float
    payment_method: str
    status: BookingStatus