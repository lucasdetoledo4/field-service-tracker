import uuid
from datetime import datetime, timezone

from app.exceptions import InvalidTransitionError, NotFoundError
from app.models.work_order import (
    VALID_TRANSITIONS,
    WorkOrder,
    WorkOrderPriority,
    WorkOrderStatus,
    WorkOrderStatusHistory,
)
from app.repositories.work_order import WorkOrderRepository
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate


class WorkOrderService:
    def __init__(self, repo: WorkOrderRepository) -> None:
        self.repo = repo

    async def list_work_orders(
        self,
        search: str | None = None,
        status: WorkOrderStatus | None = None,
        technician_id: uuid.UUID | None = None,
        client_id: uuid.UUID | None = None,
        priority: WorkOrderPriority | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[WorkOrder], int]:
        return await self.repo.get_all(
            search=search,
            status=status,
            technician_id=technician_id,
            client_id=client_id,
            priority=priority,
            limit=limit,
            offset=offset,
        )

    async def get_work_order(self, work_order_id: uuid.UUID) -> WorkOrder:
        work_order = await self.repo.get_by_id(work_order_id)
        if work_order is None:
            raise NotFoundError("Work order", work_order_id)
        return work_order

    async def create_work_order(self, data: WorkOrderCreate) -> WorkOrder:
        return await self.repo.create(data)

    async def update_work_order(self, work_order_id: uuid.UUID, data: WorkOrderUpdate) -> WorkOrder:
        work_order = await self.get_work_order(work_order_id)
        return await self.repo.update(work_order, data)

    async def delete_work_order(self, work_order_id: uuid.UUID) -> None:
        work_order = await self.get_work_order(work_order_id)
        await self.repo.delete(work_order)

    async def transition_status(
        self,
        work_order_id: uuid.UUID,
        to_status: WorkOrderStatus,
        notes: str | None = None,
    ) -> WorkOrder:
        work_order = await self.get_work_order(work_order_id)
        current_status = WorkOrderStatus(work_order.status)
        if to_status not in VALID_TRANSITIONS[current_status]:
            raise InvalidTransitionError(current_status.value, to_status.value)
        work_order.status = to_status.value
        if to_status == WorkOrderStatus.COMPLETED:
            work_order.completed_at = datetime.now(timezone.utc)
        await self.repo.add_status_history(work_order, current_status.value, to_status.value, notes)
        return work_order

    async def get_work_order_history(
        self, work_order_id: uuid.UUID
    ) -> list[WorkOrderStatusHistory]:
        await self.get_work_order(work_order_id)
        return await self.repo.get_history(work_order_id)
