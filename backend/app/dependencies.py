from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.client import ClientRepository
from app.repositories.technician import TechnicianRepository
from app.repositories.work_order import WorkOrderRepository
from app.services.client import ClientService
from app.services.technician import TechnicianService
from app.services.work_order import WorkOrderService


@dataclass
class PaginationParams:
    page: int = Query(default=1, ge=1, description="Page number (1-based)")
    page_size: int = Query(default=20, ge=1, le=10_000, description="Items per page (max 10 000; use cursor-based pagination beyond this)")

    @property
    def limit(self) -> int:
        return self.page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_client_repo(db: AsyncSession = Depends(get_db)) -> ClientRepository:
    return ClientRepository(db)


def get_technician_repo(db: AsyncSession = Depends(get_db)) -> TechnicianRepository:
    return TechnicianRepository(db)


def get_work_order_repo(db: AsyncSession = Depends(get_db)) -> WorkOrderRepository:
    return WorkOrderRepository(db)


def get_client_service(repo: ClientRepository = Depends(get_client_repo)) -> ClientService:
    return ClientService(repo)


def get_technician_service(
    repo: TechnicianRepository = Depends(get_technician_repo),
) -> TechnicianService:
    return TechnicianService(repo)


def get_work_order_service(
    repo: WorkOrderRepository = Depends(get_work_order_repo),
) -> WorkOrderService:
    return WorkOrderService(repo)


# ---------------------------------------------------------------------------
# Reusable dependency type aliases — import these in routers instead of
# repeating Depends(...) at every call site.
# ---------------------------------------------------------------------------

PaginationDep = Annotated[PaginationParams, Depends(PaginationParams)]
ClientServiceDep = Annotated[ClientService, Depends(get_client_service)]
TechnicianServiceDep = Annotated[TechnicianService, Depends(get_technician_service)]
WorkOrderServiceDep = Annotated[WorkOrderService, Depends(get_work_order_service)]
