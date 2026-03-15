import uuid

from fastapi import APIRouter, status

from app.dependencies import PaginationDep, TechnicianServiceDep
from app.schemas.base import PaginationMeta
from app.schemas.technician import (
    TechnicianCreate,
    TechnicianRead,
    TechnicianUpdate,
    TechniciansResponse,
)

router = APIRouter(prefix="/technicians", tags=["technicians"])


@router.get("")
async def list_technicians(
    pagination: PaginationDep,
    service: TechnicianServiceDep,
    search: str | None = None,
    is_active: bool | None = None,
) -> TechniciansResponse:
    items, total = await service.list_technicians(
        search=search,
        is_active=is_active,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return TechniciansResponse(
        technicians=[TechnicianRead.model_validate(item) for item in items],
        meta=PaginationMeta.build(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            items_count=len(items),
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_technician(
    service: TechnicianServiceDep,
    data: TechnicianCreate,
) -> TechnicianRead:
    return await service.create_technician(data)


@router.get("/{technician_id}")
async def get_technician(
    technician_id: uuid.UUID,
    service: TechnicianServiceDep,
) -> TechnicianRead:
    return await service.get_technician(technician_id)


@router.patch("/{technician_id}")
async def update_technician(
    technician_id: uuid.UUID,
    service: TechnicianServiceDep,
    data: TechnicianUpdate,
) -> TechnicianRead:
    return await service.update_technician(technician_id, data)


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technician(
    technician_id: uuid.UUID,
    service: TechnicianServiceDep,
) -> None:
    await service.delete_technician(technician_id)
