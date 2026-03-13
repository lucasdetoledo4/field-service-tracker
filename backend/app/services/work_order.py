import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.work_order import (
    VALID_TRANSITIONS,
    WorkOrder,
    WorkOrderPriority,
    WorkOrderStatus,
    WorkOrderStatusHistory,
)
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate


async def list_work_orders(
    db: AsyncSession,
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
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_work_order(db: AsyncSession, work_order_id: uuid.UUID) -> WorkOrder:
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == work_order_id))
    work_order = result.scalar_one_or_none()
    if work_order is None:
        raise HTTPException(status_code=404, detail="Work order not found")
    return work_order


async def create_work_order(db: AsyncSession, data: WorkOrderCreate) -> WorkOrder:
    work_order = WorkOrder(**data.model_dump())
    db.add(work_order)
    await db.commit()
    await db.refresh(work_order)
    return work_order


async def update_work_order(
    db: AsyncSession, work_order_id: uuid.UUID, data: WorkOrderUpdate
) -> WorkOrder:
    work_order = await get_work_order(db, work_order_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(work_order, key, value)
    await db.commit()
    await db.refresh(work_order)
    return work_order


async def delete_work_order(db: AsyncSession, work_order_id: uuid.UUID) -> None:
    work_order = await get_work_order(db, work_order_id)
    await db.delete(work_order)
    await db.commit()


async def transition_status(
    db: AsyncSession,
    work_order_id: uuid.UUID,
    to_status: WorkOrderStatus,
    notes: str | None = None,
) -> WorkOrder:
    work_order = await get_work_order(db, work_order_id)
    current_status = WorkOrderStatus(work_order.status)
    if to_status not in VALID_TRANSITIONS[current_status]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{current_status.value}' to '{to_status.value}'",
        )
    history = WorkOrderStatusHistory(
        work_order_id=work_order_id,
        from_status=current_status.value,
        to_status=to_status.value,
        notes=notes,
    )
    db.add(history)
    work_order.status = to_status.value
    if to_status == WorkOrderStatus.COMPLETED:
        work_order.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(work_order)
    return work_order


async def get_work_order_history(
    db: AsyncSession, work_order_id: uuid.UUID
) -> list[WorkOrderStatusHistory]:
    await get_work_order(db, work_order_id)
    result = await db.execute(
        select(WorkOrderStatusHistory)
        .where(WorkOrderStatusHistory.work_order_id == work_order_id)
        .order_by(WorkOrderStatusHistory.created_at)
    )
    return list(result.scalars().all())
