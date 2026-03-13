import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.services import client as client_service

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientRead])
async def list_clients(db: AsyncSession = Depends(get_db)):
    return await client_service.list_clients(db)


@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    return await client_service.create_client(db, data)


@router.get("/{client_id}", response_model=ClientRead)
async def get_client(client_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await client_service.get_client(db, client_id)


@router.patch("/{client_id}", response_model=ClientRead)
async def update_client(
    client_id: uuid.UUID, data: ClientUpdate, db: AsyncSession = Depends(get_db)
):
    return await client_service.update_client(db, client_id, data)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await client_service.delete_client(db, client_id)
