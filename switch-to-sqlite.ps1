# ==========================================================
#  Switch backend from Postgres to SQLite
#  Run from: ...\Documents\booking
# ==========================================================

$root = (Get-Location).Path
function Write-File($path, $content) {
  $full = Join-Path $root $path
  $dir  = [IO.Path]::GetDirectoryName($full)
  if ($dir) { [IO.Directory]::CreateDirectory($dir) | Out-Null }
  [IO.File]::WriteAllText($full, $content, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "  ~ $path" -ForegroundColor DarkGray
}

Write-Host "`nSwitching to SQLite..." -ForegroundColor Yellow

# --- requirements: swap asyncpg for aiosqlite ---
Write-File "backend\requirements.txt" @'
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy[asyncio]==2.0.35
aiosqlite==0.20.0
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
bcrypt==4.2.0
python-multipart==0.0.12
email-validator==2.2.0
'@

# --- env files ---
Write-File "backend\.env" @'
DATABASE_URL=sqlite+aiosqlite:///./booking.db
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:3000
'@

Write-File "backend\.env.example" @'
DATABASE_URL=sqlite+aiosqlite:///./booking.db
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:3000
'@

# --- config default ---
Write-File "backend\app\core\config.py" @'
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./booking.db"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MIN: int = 240
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
'@

# --- models: all datetimes naive (SQLite has no tz storage) ---
Write-File "backend\app\models.py" @'
from datetime import datetime, time
from sqlalchemy import String, Integer, ForeignKey, DateTime, Time, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
import enum

class Role(str, enum.Enum):
    user = "user"
    admin = "admin"

class BookingStatus(str, enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.user)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Service(Base):
    __tablename__ = "services"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    duration_min: Mapped[int] = mapped_column(Integer)
    price_cents: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Resource(Base):
    __tablename__ = "resources"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class WorkingHour(Base):
    __tablename__ = "working_hours"
    id: Mapped[int] = mapped_column(primary_key=True)
    resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id"))
    weekday: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)

class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"))
    resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id"))
    start_dt: Mapped[datetime] = mapped_column(DateTime)
    end_dt: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.confirmed)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
'@

# --- availability: use naive UTC datetimes ---
Write-File "backend\app\api\v1\availability.py" @'
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Service, WorkingHour, Booking, BookingStatus
from app.schemas import SlotOut

router = APIRouter(prefix="/availability", tags=["availability"])

@router.get("", response_model=list[SlotOut])
async def availability(
    service_id: int,
    resource_id: int,
    on: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
):
    service = await db.get(Service, service_id)
    if not service:
        return []
    wh = (await db.execute(select(WorkingHour).where(
        WorkingHour.resource_id == resource_id,
        WorkingHour.weekday == on.weekday(),
    ))).scalars().all()
    if not wh:
        return []

    day_start = datetime.combine(on, datetime.min.time())
    existing = (await db.execute(select(Booking).where(
        Booking.resource_id == resource_id,
        Booking.status == BookingStatus.confirmed,
        Booking.start_dt >= day_start,
        Booking.start_dt < day_start + timedelta(days=1),
    ))).scalars().all()

    dur = timedelta(minutes=service.duration_min)
    slots = []
    for block in wh:
        cursor = datetime.combine(on, block.start_time)
        block_end = datetime.combine(on, block.end_time)
        while cursor + dur <= block_end:
            slot_end = cursor + dur
            if not any(not (slot_end <= b.start_dt or cursor >= b.end_dt) for b in existing):
                slots.append(SlotOut(start=cursor, end=slot_end))
            cursor += dur
    return slots
'@

# --- remove docker-compose (no longer needed) ---
$compose = Join-Path $root "backend\docker-compose.yml"
if (Test-Path $compose) { Remove-Item $compose; Write-Host "  - backend\docker-compose.yml" -ForegroundColor DarkGray }

# --- clean stale DB if any ---
$db = Join-Path $root "backend\booking.db"
if (Test-Path $db) { Remove-Item $db; Write-Host "  - backend\booking.db (old)" -ForegroundColor DarkGray }

# --- gitignore: keep DB out of source control ---
Write-File "backend\.gitignore" @'
.venv/
__pycache__/
*.pyc
.env
*.db
'@

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SQLite switch complete" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  cd backend"
Write-Host "  .\.venv\Scripts\Activate.ps1   # if not already active"
Write-Host "  pip install -r requirements.txt"
Write-Host "  python init_db.py"
Write-Host "  python seed.py"
Write-Host "  uvicorn app.main:app --reload --port 8000"
Write-Host ""
