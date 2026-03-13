import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.technician import Technician
from app.schemas.technician import TechnicianCreate, TechnicianUpdate


async def list_technicians(db: AsyncSession) -> list[Technician]:
    result = await db.execute(select(Technician))
    return list(result.scalars().all())


async def get_technician(db: AsyncSession, technician_id: uuid.UUID) -> Technician:
    result = await db.execute(select(Technician).where(Technician.id == technician_id))
    technician = result.scalar_one_or_none()
    if technician is None:
        raise HTTPException(status_code=404, detail="Technician not found")
    return technician


async def create_technician(db: AsyncSession, data: TechnicianCreate) -> Technician:
    technician = Technician(**data.model_dump())
    db.add(technician)
    await db.commit()
    await db.refresh(technician)
    return technician


async def update_technician(
    db: AsyncSession, technician_id: uuid.UUID, data: TechnicianUpdate
) -> Technician:
    technician = await get_technician(db, technician_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(technician, key, value)
    await db.commit()
    await db.refresh(technician)
    return technician


async def delete_technician(db: AsyncSession, technician_id: uuid.UUID) -> None:
    technician = await get_technician(db, technician_id)
    await db.delete(technician)
    await db.commit()
