import uuid

from app.core.exceptions import NotFoundError
from app.technicians.models import Technician
from app.technicians.repository import TechnicianRepository
from app.core.schemas import SortDir
from app.technicians.schemas import TechnicianCreate, TechnicianSortBy, TechnicianUpdate


class TechnicianService:
    def __init__(self, repo: TechnicianRepository) -> None:
        self.repo = repo

    async def list_technicians(
        self,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: TechnicianSortBy = TechnicianSortBy.CREATED_AT,
        sort_dir: SortDir = SortDir.DESC,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Technician], int]:
        return await self.repo.get_all(
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_dir=sort_dir,
            limit=limit,
            offset=offset,
        )

    async def get_technician(self, technician_id: uuid.UUID) -> Technician:
        technician = await self.repo.get_by_id(technician_id)
        if technician is None:
            raise NotFoundError("Technician", technician_id)
        return technician

    async def create_technician(self, data: TechnicianCreate) -> Technician:
        return await self.repo.create(data)

    async def update_technician(self, technician_id: uuid.UUID, data: TechnicianUpdate) -> Technician:
        technician = await self.get_technician(technician_id)
        return await self.repo.update(technician, data)

    async def delete_technician(self, technician_id: uuid.UUID) -> None:
        technician = await self.get_technician(technician_id)
        await self.repo.delete(technician)
