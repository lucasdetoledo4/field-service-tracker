import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.work_order import (
    WorkOrder,
    WorkOrderPriority,
    WorkOrderStatus,
    WorkOrderStatusHistory,
)
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate


class WorkOrderRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(
        self,
        status: WorkOrderStatus | None = None,
        technician_id: uuid.UUID | None = None,
        client_id: uuid.UUID | None = None,
        priority: WorkOrderPriority | None = None,
    ) -> list[WorkOrder]:
        query = select(WorkOrder)
        if status is not None:
            query = query.where(WorkOrder.status == status.value)
        if technician_id is not None:
            query = query.where(WorkOrder.technician_id == technician_id)
        if client_id is not None:
            query = query.where(WorkOrder.client_id == client_id)
        if priority is not None:
            query = query.where(WorkOrder.priority == priority.value)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, id: uuid.UUID) -> WorkOrder | None:
        result = await self.db.execute(select(WorkOrder).where(WorkOrder.id == id))
        return result.scalar_one_or_none()

    async def create(self, data: WorkOrderCreate) -> WorkOrder:
        work_order = WorkOrder(**data.model_dump())
        self.db.add(work_order)
        await self.db.commit()
        await self.db.refresh(work_order)
        return work_order

    async def update(self, work_order: WorkOrder, data: WorkOrderUpdate) -> WorkOrder:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(work_order, key, value)
        await self.db.commit()
        await self.db.refresh(work_order)
        return work_order

    async def delete(self, work_order: WorkOrder) -> None:
        await self.db.delete(work_order)
        await self.db.commit()

    async def add_status_history(
        self,
        work_order: WorkOrder,
        from_status: str,
        to_status: str,
        notes: str | None,
    ) -> None:
        history = WorkOrderStatusHistory(
            work_order_id=work_order.id,
            from_status=from_status,
            to_status=to_status,
            notes=notes,
        )
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(work_order)

    async def get_history(self, work_order_id: uuid.UUID) -> list[WorkOrderStatusHistory]:
        result = await self.db.execute(
            select(WorkOrderStatusHistory)
            .where(WorkOrderStatusHistory.work_order_id == work_order_id)
            .order_by(WorkOrderStatusHistory.created_at)
        )
        return list(result.scalars().all())
