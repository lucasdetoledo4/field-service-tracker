import uuid

from fastapi import APIRouter, status

from app.dependencies import ClientServiceDep, PaginationDep
from app.schemas.base import PaginationMeta, SortDir
from app.schemas.client import (
    ClientCreate,
    ClientRead,
    ClientSortBy,
    ClientsResponse,
    ClientUpdate,
)

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("")
async def list_clients(
    pagination: PaginationDep,
    service: ClientServiceDep,
    search: str | None = None,
    sort_by: ClientSortBy = ClientSortBy.created_at,
    sort_dir: SortDir = SortDir.desc,
) -> ClientsResponse:
    items, total = await service.list_clients(
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return ClientsResponse(
        clients=[ClientRead.model_validate(item) for item in items],
        meta=PaginationMeta(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            items_count=len(items),
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_client(
    service: ClientServiceDep,
    data: ClientCreate,
) -> ClientRead:
    return ClientRead.model_validate(await service.create_client(data))


@router.get("/{client_id}")
async def get_client(
    client_id: uuid.UUID,
    service: ClientServiceDep,
) -> ClientRead:
    return ClientRead.model_validate(await service.get_client(client_id))


@router.patch("/{client_id}")
async def update_client(
    client_id: uuid.UUID,
    service: ClientServiceDep,
    data: ClientUpdate,
) -> ClientRead:
    return ClientRead.model_validate(await service.update_client(client_id, data))


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: uuid.UUID,
    service: ClientServiceDep,
) -> None:
    await service.delete_client(client_id)
