import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate


class ClientRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self) -> list[Client]:
        result = await self.db.execute(select(Client))
        return list(result.scalars().all())

    async def get_by_id(self, id: uuid.UUID) -> Client | None:
        result = await self.db.execute(select(Client).where(Client.id == id))
        return result.scalar_one_or_none()

    async def create(self, data: ClientCreate) -> Client:
        client = Client(**data.model_dump())
        self.db.add(client)
        await self.db.commit()
        await self.db.refresh(client)
        return client

    async def update(self, client: Client, data: ClientUpdate) -> Client:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(client, key, value)
        await self.db.commit()
        await self.db.refresh(client)
        return client

    async def delete(self, client: Client) -> None:
        await self.db.delete(client)
        await self.db.commit()
