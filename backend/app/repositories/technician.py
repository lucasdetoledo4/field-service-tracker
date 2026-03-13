import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.technician import Technician
from app.schemas.technician import TechnicianCreate, TechnicianUpdate


class TechnicianRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self) -> list[Technician]:
        result = await self.db.execute(select(Technician))
        return list(result.scalars().all())

    async def get_by_id(self, id: uuid.UUID) -> Technician | None:
        result = await self.db.execute(select(Technician).where(Technician.id == id))
        return result.scalar_one_or_none()

    async def create(self, data: TechnicianCreate) -> Technician:
        technician = Technician(**data.model_dump())
        self.db.add(technician)
        await self.db.commit()
        await self.db.refresh(technician)
        return technician

    async def update(self, technician: Technician, data: TechnicianUpdate) -> Technician:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(technician, key, value)
        await self.db.commit()
        await self.db.refresh(technician)
        return technician

    async def delete(self, technician: Technician) -> None:
        await self.db.delete(technician)
        await self.db.commit()
