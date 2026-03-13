import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate


async def list_clients(db: AsyncSession) -> list[Client]:
    result = await db.execute(select(Client))
    return list(result.scalars().all())


async def get_client(db: AsyncSession, client_id: uuid.UUID) -> Client:
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


async def create_client(db: AsyncSession, data: ClientCreate) -> Client:
    client = Client(**data.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


async def update_client(db: AsyncSession, client_id: uuid.UUID, data: ClientUpdate) -> Client:
    client = await get_client(db, client_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    await db.commit()
    await db.refresh(client)
    return client


async def delete_client(db: AsyncSession, client_id: uuid.UUID) -> None:
    client = await get_client(db, client_id)
    await db.delete(client)
    await db.commit()
