import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies import PaginationParams, get_client_service
from app.schemas.base import PaginationMeta
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate, ClientsResponse
from app.services.client import ClientService

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("")
async def list_clients(
    search: str | None = None,
    pagination: PaginationParams = Depends(PaginationParams),
    service: ClientService = Depends(get_client_service),
) -> ClientsResponse:
    items, total = await service.list_clients(
        search=search,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return ClientsResponse(
        clients=items,
        meta=PaginationMeta.build(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            items_count=len(items),
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_client(
    data: ClientCreate,
    service: ClientService = Depends(get_client_service),
) -> ClientRead:
    return await service.create_client(data)


@router.get("/{client_id}")
async def get_client(
    client_id: uuid.UUID,
    service: ClientService = Depends(get_client_service),
) -> ClientRead:
    return await service.get_client(client_id)


@router.patch("/{client_id}")
async def update_client(
    client_id: uuid.UUID,
    data: ClientUpdate,
    service: ClientService = Depends(get_client_service),
) -> ClientRead:
    return await service.update_client(client_id, data)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: uuid.UUID,
    service: ClientService = Depends(get_client_service),
) -> None:
    await service.delete_client(client_id)
