import uuid
from datetime import datetime
from enum import StrEnum, auto
from typing import Annotated

from pydantic import StringConstraints

from app.work_orders.enums import WorkOrderPriority, WorkOrderStatus
from app.core.schemas import CustomBaseModel, PaginationMeta, ShortStr


class WorkOrderSortBy(StrEnum):
    TITLE = auto()
    DESCRIPTION = auto()
    STATUS = auto()
    PRIORITY = auto()
    SCHEDULED_AT = auto()
    COMPLETED_AT = auto()
    CREATED_AT = auto()
    UPDATED_AT = auto()
    CLIENT_NAME = auto()
    TECHNICIAN_NAME = auto()

_StrippedStr = Annotated[str, StringConstraints(strip_whitespace=True)]


class WorkOrderCreate(CustomBaseModel):
    title: ShortStr
    description: _StrippedStr | None = None
    priority: WorkOrderPriority = WorkOrderPriority.MEDIUM
    client_id: uuid.UUID | None = None
    technician_id: uuid.UUID | None = None
    scheduled_at: datetime | None = None


class WorkOrderUpdate(CustomBaseModel):
    title: ShortStr | None = None
    description: _StrippedStr | None = None
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
    notes: _StrippedStr | None = None


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
