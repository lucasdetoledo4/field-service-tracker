from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.work_orders.repository import WorkOrderRepository
from app.work_orders.service import WorkOrderService


def get_work_order_repo(db: AsyncSession = Depends(get_db)) -> WorkOrderRepository:
    return WorkOrderRepository(db)


def get_work_order_service(
    repo: WorkOrderRepository = Depends(get_work_order_repo),
) -> WorkOrderService:
    return WorkOrderService(repo)


WorkOrderRepoDep = Annotated[WorkOrderRepository, Depends(get_work_order_repo)]
WorkOrderServiceDep = Annotated[WorkOrderService, Depends(get_work_order_service)]
