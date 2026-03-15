import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies import PaginationParams, get_technician_service
from app.schemas.base import PaginationMeta
from app.schemas.technician import (
    TechnicianCreate,
    TechnicianRead,
    TechnicianUpdate,
    TechniciansResponse,
)
from app.services.technician import TechnicianService

router = APIRouter(prefix="/technicians", tags=["technicians"])


@router.get("")
async def list_technicians(
    search: str | None = None,
    is_active: bool | None = None,
    pagination: PaginationParams = Depends(PaginationParams),
    service: TechnicianService = Depends(get_technician_service),
) -> TechniciansResponse:
    items, total = await service.list_technicians(
        search=search,
        is_active=is_active,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return TechniciansResponse(
        technicians=items,
        meta=PaginationMeta.build(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            items_count=len(items),
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_technician(
    data: TechnicianCreate,
    service: TechnicianService = Depends(get_technician_service),
) -> TechnicianRead:
    return await service.create_technician(data)


@router.get("/{technician_id}")
async def get_technician(
    technician_id: uuid.UUID,
    service: TechnicianService = Depends(get_technician_service),
) -> TechnicianRead:
    return await service.get_technician(technician_id)


@router.patch("/{technician_id}")
async def update_technician(
    technician_id: uuid.UUID,
    data: TechnicianUpdate,
    service: TechnicianService = Depends(get_technician_service),
) -> TechnicianRead:
    return await service.update_technician(technician_id, data)


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technician(
    technician_id: uuid.UUID,
    service: TechnicianService = Depends(get_technician_service),
) -> None:
    await service.delete_technician(technician_id)
