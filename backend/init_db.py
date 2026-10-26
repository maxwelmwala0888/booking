import asyncio
from app.db.session import engine
from app.db.base import Base
from app import models  # noqa: F401

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created")

asyncio.run(main())