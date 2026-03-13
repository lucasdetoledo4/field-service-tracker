import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.technician import TechnicianCreate, TechnicianRead, TechnicianUpdate
from app.services import technician as technician_service

router = APIRouter(prefix="/technicians", tags=["technicians"])


@router.get("", response_model=list[TechnicianRead])
async def list_technicians(db: AsyncSession = Depends(get_db)):
    return await technician_service.list_technicians(db)


@router.post("", response_model=TechnicianRead, status_code=status.HTTP_201_CREATED)
async def create_technician(data: TechnicianCreate, db: AsyncSession = Depends(get_db)):
    return await technician_service.create_technician(db, data)


@router.get("/{technician_id}", response_model=TechnicianRead)
async def get_technician(technician_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await technician_service.get_technician(db, technician_id)


@router.patch("/{technician_id}", response_model=TechnicianRead)
async def update_technician(
    technician_id: uuid.UUID, data: TechnicianUpdate, db: AsyncSession = Depends(get_db)
):
    return await technician_service.update_technician(db, technician_id, data)


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technician(technician_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await technician_service.delete_technician(db, technician_id)
