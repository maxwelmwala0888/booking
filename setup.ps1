# ==========================================================
#  Booking app - full scaffold
#  Works on Windows PowerShell 5.1  AND  PowerShell 7+
#  Run from: ...\Documents\booking
# ==========================================================

$root = (Get-Location).Path
Write-Host ""
Write-Host "Working in: $root" -ForegroundColor Cyan
Write-Host "PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Cyan
Write-Host ""

# ---------- helpers (use .NET so it works on ALL PowerShell versions) ----------
function Ensure-Dir($path) {
  $full = if ([IO.Path]::IsPathRooted($path)) { $path } else { Join-Path $root $path }
  [IO.Directory]::CreateDirectory($full) | Out-Null
}

function Write-File($path, $content) {
  $full = Join-Path $root $path
  $dir  = [IO.Path]::GetDirectoryName($full)
  if ($dir) { [IO.Directory]::CreateDirectory($dir) | Out-Null }
  [IO.File]::WriteAllText($full, $content, (New-Object System.Text.UTF8Encoding $false))
  Write-Host "  + $path" -ForegroundColor DarkGray
}

# ==========================================================
#  SECTION 1 — BACKEND
# ==========================================================

Write-Host "`nCreating backend..." -ForegroundColor Yellow
foreach ($d in @("backend\app\core","backend\app\db","backend\app\api\v1")) {
  Ensure-Dir (Join-Path $root $d)
}

Write-File "backend\requirements.txt" @'
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy[asyncio]==2.0.35
asyncpg==0.29.0
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
bcrypt==4.2.0
python-multipart==0.0.12
email-validator==2.2.0
'@

Write-File "backend\.env" @'
DATABASE_URL=postgresql+asyncpg://booking:booking@localhost:5432/booking
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:3000
'@

Write-File "backend\.env.example" @'
DATABASE_URL=postgresql+asyncpg://booking:booking@localhost:5432/booking
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:3000
'@

Write-File "backend\docker-compose.yml" @'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: booking
      POSTGRES_PASSWORD: booking
      POSTGRES_DB: booking
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
'@

foreach ($p in @(
  "backend\app\__init__.py",
  "backend\app\core\__init__.py",
  "backend\app\db\__init__.py",
  "backend\app\api\__init__.py",
  "backend\app\api\v1\__init__.py"
)) { Write-File $p "" }

Write-File "backend\app\core\config.py" @'
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://booking:booking@localhost:5432/booking"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MIN: int = 240
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
'@

Write-File "backend\app\core\security.py" @'
from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
from app.core.config import settings

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())

def create_access_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MIN)
    return jwt.encode({"sub": sub, "exp": exp}, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
'@

Write-File "backend\app\core\deps.py" @'
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from app.db.session import get_db
from app.core.security import decode_token
from app.models import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        user_id = int(decode_token(token)["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != Role.admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return user
'@

Write-File "backend\app\db\base.py" @'
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
'@

Write-File "backend\app\db\session.py" @'
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with SessionLocal() as session:
        yield session
'@

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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

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
    start_dt: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_dt: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.confirmed)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
'@

Write-File "backend\app\schemas.py" @'
from datetime import datetime, time
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models import Role, BookingStatus

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    role: Role

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    duration_min: int
    price_cents: int = 0

class ServiceOut(ServiceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool

class ResourceCreate(BaseModel):
    name: str

class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    is_active: bool

class WorkingHourIn(BaseModel):
    weekday: int
    start_time: time
    end_time: time

class SlotOut(BaseModel):
    start: datetime
    end: datetime

class BookingCreate(BaseModel):
    service_id: int
    resource_id: int
    start_dt: datetime
    notes: str | None = None

class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    service_id: int
    resource_id: int
    start_dt: datetime
    end_dt: datetime
    status: BookingStatus
    notes: str | None
'@

Write-File "backend\app\api\v1\auth.py" @'
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import User
from app.schemas import UserCreate, UserOut, TokenOut
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    exists = (await db.execute(select(User).where(User.email == data.email))).scalar_one_or_none()
    if exists:
        raise HTTPException(400, "Email already registered")
    user = User(email=data.email, hashed_password=hash_password(data.password),
                full_name=data.full_name, phone=data.phone)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=TokenOut)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == form.username))).scalar_one_or_none()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return TokenOut(access_token=create_access_token(str(user.id)))

@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user
'@

Write-File "backend\app\api\v1\services.py" @'
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Service
from app.schemas import ServiceCreate, ServiceOut
from app.core.deps import require_admin

router = APIRouter(prefix="/services", tags=["services"])

@router.get("", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Service).where(Service.is_active == True))).scalars().all()

@router.post("", response_model=ServiceOut, dependencies=[Depends(require_admin)])
async def create_service(data: ServiceCreate, db: AsyncSession = Depends(get_db)):
    s = Service(**data.model_dump())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s
'@

Write-File "backend\app\api\v1\resources.py" @'
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Resource, WorkingHour
from app.schemas import ResourceCreate, ResourceOut, WorkingHourIn
from app.core.deps import require_admin

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("", response_model=list[ResourceOut])
async def list_resources(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Resource).where(Resource.is_active == True))).scalars().all()

@router.post("", response_model=ResourceOut, dependencies=[Depends(require_admin)])
async def create_resource(data: ResourceCreate, db: AsyncSession = Depends(get_db)):
    r = Resource(**data.model_dump())
    db.add(r)
    await db.commit()
    await db.refresh(r)
    return r

@router.post("/{resource_id}/hours", dependencies=[Depends(require_admin)])
async def set_hours(resource_id: int, hours: list[WorkingHourIn], db: AsyncSession = Depends(get_db)):
    for h in hours:
        db.add(WorkingHour(resource_id=resource_id, **h.model_dump()))
    await db.commit()
    return {"ok": True}
'@

Write-File "backend\app\api\v1\availability.py" @'
from datetime import datetime, date, timedelta, timezone
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

    day_start = datetime.combine(on, datetime.min.time(), tzinfo=timezone.utc)
    existing = (await db.execute(select(Booking).where(
        Booking.resource_id == resource_id,
        Booking.status == BookingStatus.confirmed,
        Booking.start_dt >= day_start,
        Booking.start_dt < day_start + timedelta(days=1),
    ))).scalars().all()

    dur = timedelta(minutes=service.duration_min)
    slots = []
    for block in wh:
        cursor = datetime.combine(on, block.start_time, tzinfo=timezone.utc)
        block_end = datetime.combine(on, block.end_time, tzinfo=timezone.utc)
        while cursor + dur <= block_end:
            slot_end = cursor + dur
            if not any(not (slot_end <= b.start_dt or cursor >= b.end_dt) for b in existing):
                slots.append(SlotOut(start=cursor, end=slot_end))
            cursor += dur
    return slots
'@

Write-File "backend\app\api\v1\bookings.py" @'
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Service, Booking, BookingStatus, User
from app.schemas import BookingCreate, BookingOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("", response_model=BookingOut)
async def create_booking(data: BookingCreate, db: AsyncSession = Depends(get_db),
                         user: User = Depends(get_current_user)):
    service = await db.get(Service, data.service_id)
    if not service:
        raise HTTPException(404, "Service not found")
    end_dt = data.start_dt + timedelta(minutes=service.duration_min)

    overlap = (await db.execute(select(Booking).where(
        Booking.resource_id == data.resource_id,
        Booking.status == BookingStatus.confirmed,
        Booking.start_dt < end_dt,
        Booking.end_dt > data.start_dt,
    ))).scalars().first()
    if overlap:
        raise HTTPException(409, "Slot not available")

    b = Booking(user_id=user.id, service_id=data.service_id, resource_id=data.resource_id,
                start_dt=data.start_dt, end_dt=end_dt, notes=data.notes)
    db.add(b)
    await db.commit()
    await db.refresh(b)
    return b

@router.get("/me", response_model=list[BookingOut])
async def my_bookings(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    return (await db.execute(select(Booking)
        .where(Booking.user_id == user.id)
        .order_by(Booking.start_dt.desc()))).scalars().all()

@router.delete("/{booking_id}", response_model=BookingOut)
async def cancel(booking_id: int, db: AsyncSession = Depends(get_db),
                 user: User = Depends(get_current_user)):
    b = await db.get(Booking, booking_id)
    if not b or b.user_id != user.id:
        raise HTTPException(404, "Not found")
    b.status = BookingStatus.cancelled
    await db.commit()
    await db.refresh(b)
    return b
'@

Write-File "backend\app\api\router.py" @'
from fastapi import APIRouter
from app.api.v1 import auth, services, resources, availability, bookings

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(services.router)
api_router.include_router(resources.router)
api_router.include_router(availability.router)
api_router.include_router(bookings.router)
'@

Write-File "backend\app\main.py" @'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings

app = FastAPI(title="Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
def health():
    return {"ok": True}
'@

Write-File "backend\init_db.py" @'
import asyncio
from app.db.session import engine
from app.db.base import Base
from app import models  # noqa: F401

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created")

asyncio.run(main())
'@

Write-File "backend\seed.py" @'
import asyncio
from datetime import time
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models import User, Service, Resource, WorkingHour, Role
from app.core.security import hash_password

async def main():
    async with SessionLocal() as db:
        if not (await db.execute(select(User).where(User.email == "admin@local"))).scalar_one_or_none():
            db.add(User(email="admin@local", hashed_password=hash_password("admin123"),
                        full_name="Admin", role=Role.admin))
        if not (await db.execute(select(Service))).scalars().first():
            db.add(Service(name="Haircut", description="30 min cut", duration_min=30, price_cents=2500))
            db.add(Service(name="Consultation", description="1 hour talk", duration_min=60, price_cents=5000))
        if not (await db.execute(select(Resource))).scalars().first():
            r = Resource(name="Alice")
            db.add(r)
            await db.flush()
            for wd in range(5):
                db.add(WorkingHour(resource_id=r.id, weekday=wd,
                                   start_time=time(9, 0), end_time=time(17, 0)))
        await db.commit()
    print("Seeded")

asyncio.run(main())
'@

Write-File "backend\.gitignore" @'
.venv/
__pycache__/
*.pyc
.env
'@

# ==========================================================
#  SECTION 2 — FRONTEND
# ==========================================================

Write-Host "`nCreating frontend..." -ForegroundColor Yellow
foreach ($d in @(
  "frontend\app\login",
  "frontend\app\register",
  "frontend\app\book\[serviceId]",
  "frontend\app\bookings",
  "frontend\lib"
)) {
  Ensure-Dir (Join-Path $root $d)
}

Write-File "frontend\package.json" @'
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^4.0.0"
  }
}
'@

Write-File "frontend\next.config.mjs" @'
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
export default nextConfig;
'@

Write-File "frontend\postcss.config.mjs" @'
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
'@

Write-File "frontend\jsconfig.json" @'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
'@

Write-File "frontend\.gitignore" @'
node_modules/
.next/
.env.local
'@

Write-File "frontend\.env.local" @'
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
'@

Write-File "frontend\app\globals.css" @'
@import "tailwindcss";
'@

Write-File "frontend\app\layout.jsx" @'
import "./globals.css";

export const metadata = { title: "Booking App", description: "Book anything" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
'@

Write-File "frontend\lib\api.js" @'
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(method, path, body, form = false) {
  const headers = {};
  const t = getToken();
  if (t) headers["Authorization"] = "Bearer " + t;
  let payload;
  if (body && form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(body).toString();
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b, form = false) => request("POST", p, b, form),
  del: (p) => request("DELETE", p),
};
'@

Write-File "frontend\app\page.jsx" @'
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function Home() {
  const [services, setServices] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/services").then(setServices).catch((e) => setErr(e.message));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <nav className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Book It</h1>
        <div className="space-x-3">
          <Link href="/login" className="underline">Login</Link>
          <Link href="/register" className="underline">Register</Link>
          <Link href="/bookings" className="underline">My bookings</Link>
        </div>
      </nav>
      {err && <p className="text-red-600">{err}</p>}
      <ul className="grid gap-3">
        {services.map((s) => (
          <li key={s.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-gray-600">
                {s.duration_min} min &middot; K{(s.price_cents / 100).toFixed(2)}
              </div>
            </div>
            <Link href={`/book/${s.id}`} className="bg-black text-white px-4 py-2 rounded">
              Book
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
'@

Write-File "frontend\app\register\page.jsx" @'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Register() {
  const [f, setF] = useState({ email: "", password: "", full_name: "" });
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register", f);
      router.push("/login");
    } catch (e) { setErr(e.message); }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Full name"
          value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Email" type="email"
          value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Password" type="password"
          value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="bg-black text-white px-4 py-2 rounded w-full">Create account</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </main>
  );
}
'@

Write-File "frontend\app\login\page.jsx" @'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    try {
      const r = await api.post("/auth/login", { username: email, password }, true);
      localStorage.setItem("token", r.access_token);
      router.push("/");
    } catch (e) { setErr(e.message); }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" type="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded w-full">Sign in</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </main>
  );
}
'@

Write-File "frontend\app\book\[serviceId]\page.jsx" @'
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function BookPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/resources").then(setResources).catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!resourceId || !date) return;
    setSelected(null);
    api.get(`/availability?service_id=${serviceId}&resource_id=${resourceId}&date=${date}`)
      .then(setSlots).catch((e) => setErr(e.message));
  }, [resourceId, date, serviceId]);

  async function book() {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    try {
      await api.post("/bookings", {
        service_id: Number(serviceId),
        resource_id: Number(resourceId),
        start_dt: selected.start,
      });
      router.push("/bookings");
    } catch (e) { setErr(e.message); }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl">Book service #{serviceId}</h1>
      {err && <p className="text-red-600">{err}</p>}

      <div>
        <label className="block mb-1">Who</label>
        <select className="border p-2 w-full" value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}>
          <option value="">-- select --</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Date</label>
        <input type="date" className="border p-2 w-full" value={date}
          onChange={(e) => setDate(e.target.value)} />
      </div>

      <div>
        <label className="block mb-1">Available slots</label>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s) => (
            <button key={s.start}
              onClick={() => setSelected(s)}
              className={"border rounded p-2 " + (selected?.start === s.start ? "bg-black text-white" : "")}>
              {new Date(s.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </button>
          ))}
          {slots.length === 0 && <p className="text-sm text-gray-500">No slots</p>}
        </div>
      </div>

      <button disabled={!selected} onClick={book}
        className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-40">
        Confirm booking
      </button>
    </main>
  );
}
'@

Write-File "frontend\app\bookings\page.jsx" @'
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function MyBookings() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try { setRows(await api.get("/bookings/me")); }
    catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm("Cancel this booking?")) return;
    await api.del(`/bookings/${id}`);
    load();
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl mb-4">My bookings</h1>
      {err && <p className="text-red-600">{err}</p>}
      <ul className="space-y-3">
        {rows.map((b) => (
          <li key={b.id} className="border rounded p-4 flex justify-between">
            <div>
              <div className="font-semibold">
                {new Date(b.start_dt).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Service #{b.service_id} &middot; status: {b.status}
              </div>
            </div>
            {b.status === "confirmed" && (
              <button onClick={() => cancel(b.id)} className="text-red-600 underline">
                Cancel
              </button>
            )}
          </li>
        ))}
        {rows.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
      </ul>
    </main>
  );
}
'@

# ==========================================================
#  DONE
# ==========================================================

$bk = @(Get-ChildItem -Recurse -File backend  -ErrorAction SilentlyContinue).Count
$fe = @(Get-ChildItem -Recurse -File frontend -ErrorAction SilentlyContinue).Count

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  DONE" -ForegroundColor Green
Write-Host "  backend  files: $bk" -ForegroundColor Green
Write-Host "  frontend files: $fe" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # 1) Backend" -ForegroundColor Yellow
Write-Host "  cd backend"
Write-Host "  python -m venv .venv"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host "  pip install -r requirements.txt"
Write-Host "  docker compose up -d"
Write-Host "  Start-Sleep 6"
Write-Host "  python init_db.py"
Write-Host "  python seed.py"
Write-Host "  uvicorn app.main:app --reload --port 8000"
Write-Host ""
Write-Host "  # 2) Frontend (new PowerShell window, back in booking folder)" -ForegroundColor Yellow
Write-Host "  cd frontend"
Write-Host "  npm install"
Write-Host "  npm run dev"
Write-Host ""