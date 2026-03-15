import uuid

from app.exceptions import NotFoundError
from app.models.client import Client
from app.repositories.client import ClientRepository
from app.schemas.base import SortDir
from app.schemas.client import ClientCreate, ClientSortBy, ClientUpdate


class ClientService:
    def __init__(self, repo: ClientRepository) -> None:
        self.repo = repo

    async def list_clients(
        self,
        search: str | None = None,
        sort_by: ClientSortBy = ClientSortBy.CREATED_AT,
        sort_dir: SortDir = SortDir.DESC,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Client], int]:
        return await self.repo.get_all(
            search=search, sort_by=sort_by, sort_dir=sort_dir, limit=limit, offset=offset
        )

    async def get_client(self, client_id: uuid.UUID) -> Client:
        client = await self.repo.get_by_id(client_id)
        if client is None:
            raise NotFoundError("Client", client_id)
        return client

    async def create_client(self, data: ClientCreate) -> Client:
        return await self.repo.create(data)

    async def update_client(self, client_id: uuid.UUID, data: ClientUpdate) -> Client:
        client = await self.get_client(client_id)
        return await self.repo.update(client, data)

    async def delete_client(self, client_id: uuid.UUID) -> None:
        client = await self.get_client(client_id)
        await self.repo.delete(client)
