from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.clients.repository import ClientRepository
from app.clients.service import ClientService


def get_client_repo(db: AsyncSession = Depends(get_db)) -> ClientRepository:
    return ClientRepository(db)


def get_client_service(repo: ClientRepository = Depends(get_client_repo)) -> ClientService:
    return ClientService(repo)


ClientRepoDep = Annotated[ClientRepository, Depends(get_client_repo)]
ClientServiceDep = Annotated[ClientService, Depends(get_client_service)]
