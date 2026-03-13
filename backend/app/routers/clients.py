import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies import get_client_service
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.services.client import ClientService

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientRead])
async def list_clients(service: ClientService = Depends(get_client_service)):
    return await service.list_clients()


@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(data: ClientCreate, service: ClientService = Depends(get_client_service)):
    return await service.create_client(data)


@router.get("/{client_id}", response_model=ClientRead)
async def get_client(client_id: uuid.UUID, service: ClientService = Depends(get_client_service)):
    return await service.get_client(client_id)


@router.patch("/{client_id}", response_model=ClientRead)
async def update_client(
    client_id: uuid.UUID, data: ClientUpdate, service: ClientService = Depends(get_client_service)
):
    return await service.update_client(client_id, data)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: uuid.UUID, service: ClientService = Depends(get_client_service)
):
    await service.delete_client(client_id)
