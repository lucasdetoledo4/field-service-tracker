import uuid
from datetime import datetime

from app.models.work_order import WorkOrderPriority, WorkOrderStatus
from app.schemas.base import CustomBaseModel, PaginationMeta


class WorkOrderCreate(CustomBaseModel):
    title: str
    description: str | None = None
    priority: WorkOrderPriority = WorkOrderPriority.MEDIUM
    client_id: uuid.UUID | None = None
    technician_id: uuid.UUID | None = None
    scheduled_at: datetime | None = None


class WorkOrderUpdate(CustomBaseModel):
    title: str | None = None
    description: str | None = None
    priority: WorkOrderPriority | None = None
    client_id: uuid.UUID | None = None
    technician_id: uuid.UUID | None = None
    scheduled_at: datetime | None = None


class WorkOrderRead(CustomBaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    status: WorkOrderStatus
    priority: WorkOrderPriority
    client_id: uuid.UUID | None
    technician_id: uuid.UUID | None
    scheduled_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class StatusTransitionRequest(CustomBaseModel):
    to_status: WorkOrderStatus
    notes: str | None = None


class WorkOrderStatusHistoryRead(CustomBaseModel):
    id: uuid.UUID
    work_order_id: uuid.UUID
    from_status: WorkOrderStatus | None
    to_status: WorkOrderStatus
    notes: str | None
    created_at: datetime


class WorkOrdersResponse(CustomBaseModel):
    work_orders: list[WorkOrderRead]
    meta: PaginationMeta
