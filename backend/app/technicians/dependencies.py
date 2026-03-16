from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.technicians.repository import TechnicianRepository
from app.technicians.service import TechnicianService


def get_technician_repo(db: AsyncSession = Depends(get_db)) -> TechnicianRepository:
    return TechnicianRepository(db)


def get_technician_service(
    repo: TechnicianRepository = Depends(get_technician_repo),
) -> TechnicianService:
    return TechnicianService(repo)


TechnicianRepoDep = Annotated[TechnicianRepository, Depends(get_technician_repo)]
TechnicianServiceDep = Annotated[TechnicianService, Depends(get_technician_service)]
