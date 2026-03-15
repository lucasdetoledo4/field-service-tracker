import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.work_order import (
    WorkOrder,
    WorkOrderPriority,
    WorkOrderStatus,
    WorkOrderStatusHistory,
)
from app.schemas.base import SortDir
from app.schemas.work_order import WorkOrderCreate, WorkOrderSortBy, WorkOrderUpdate


class WorkOrderRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(
        self,
        search: str | None = None,
        status: WorkOrderStatus | None = None,
        technician_id: uuid.UUID | None = None,
        client_id: uuid.UUID | None = None,
        priority: WorkOrderPriority | None = None,
        sort_by: WorkOrderSortBy = WorkOrderSortBy.CREATED_AT,
        sort_dir: SortDir = SortDir.DESC,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[WorkOrder], int]:
        stmt = select(WorkOrder)
        if search:
            stmt = stmt.where(WorkOrder.title.ilike(f"%{search}%"))
        if status is not None:
            stmt = stmt.where(WorkOrder.status == status.value)
        if technician_id is not None:
            stmt = stmt.where(WorkOrder.technician_id == technician_id)
        if client_id is not None:
            stmt = stmt.where(WorkOrder.client_id == client_id)
        if priority is not None:
            stmt = stmt.where(WorkOrder.priority == priority.value)

        total = (
            await self.db.execute(select(func.count()).select_from(stmt.subquery()))
        ).scalar_one()

        col = getattr(WorkOrder, sort_by)
        order_col = col.asc() if sort_dir == SortDir.ASC else col.desc()
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
