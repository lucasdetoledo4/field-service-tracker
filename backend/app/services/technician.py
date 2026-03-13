import uuid

from fastapi import HTTPException

from app.models.technician import Technician
from app.repositories.technician import TechnicianRepository
from app.schemas.technician import TechnicianCreate, TechnicianUpdate


class TechnicianService:
    def __init__(self, repo: TechnicianRepository) -> None:
        self.repo = repo

    async def list_technicians(self) -> list[Technician]:
        return await self.repo.get_all()

    async def get_technician(self, technician_id: uuid.UUID) -> Technician:
        technician = await self.repo.get_by_id(technician_id)
        if technician is None:
            raise HTTPException(status_code=404, detail="Technician not found")
        return technician

    async def create_technician(self, data: TechnicianCreate) -> Technician:
        return await self.repo.create(data)

    async def update_technician(self, technician_id: uuid.UUID, data: TechnicianUpdate) -> Technician:
        technician = await self.get_technician(technician_id)
        return await self.repo.update(technician, data)

    async def delete_technician(self, technician_id: uuid.UUID) -> None:
        technician = await self.get_technician(technician_id)
        await self.repo.delete(technician)
