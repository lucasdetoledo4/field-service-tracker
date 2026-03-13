import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies import get_technician_service
from app.schemas.technician import TechnicianCreate, TechnicianRead, TechnicianUpdate
from app.services.technician import TechnicianService

router = APIRouter(prefix="/technicians", tags=["technicians"])


@router.get("", response_model=list[TechnicianRead])
async def list_technicians(service: TechnicianService = Depends(get_technician_service)):
    return await service.list_technicians()


@router.post("", response_model=TechnicianRead, status_code=status.HTTP_201_CREATED)
async def create_technician(
    data: TechnicianCreate, service: TechnicianService = Depends(get_technician_service)
):
    return await service.create_technician(data)


@router.get("/{technician_id}", response_model=TechnicianRead)
async def get_technician(
    technician_id: uuid.UUID, service: TechnicianService = Depends(get_technician_service)
):
    return await service.get_technician(technician_id)


@router.patch("/{technician_id}", response_model=TechnicianRead)
async def update_technician(
    technician_id: uuid.UUID,
    data: TechnicianUpdate,
    service: TechnicianService = Depends(get_technician_service),
):
    return await service.update_technician(technician_id, data)


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technician(
    technician_id: uuid.UUID, service: TechnicianService = Depends(get_technician_service)
):
    await service.delete_technician(technician_id)
