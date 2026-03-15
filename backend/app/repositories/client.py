import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.schemas.base import SortDir
from app.schemas.client import ClientCreate, ClientSortBy, ClientUpdate


class ClientRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(
        self,
        search: str | None = None,
        sort_by: ClientSortBy = ClientSortBy.created_at,
        sort_dir: SortDir = SortDir.desc,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Client], int]:
        stmt = select(Client)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(Client.name.ilike(pattern), Client.email.ilike(pattern))
            )

        total = (
            await self.db.execute(select(func.count()).select_from(stmt.subquery()))
        ).scalar_one()

        col = getattr(Client, sort_by)
        order_col = col.asc() if sort_dir == SortDir.asc else col.desc()
        items = list(
            (
                await self.db.execute(
                    stmt.order_by(order_col).limit(limit).offset(offset)
                )
            )
            .scalars()
            .all()
        )
        return items, total

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
