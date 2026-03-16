import uuid
from datetime import datetime
from enum import StrEnum, auto

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base, TimestampMixin, UUIDMixin


class WorkOrderStatus(StrEnum):
    CANCELLED = auto()
    PENDING = auto()
    ASSIGNED = auto()
    IN_PROGRESS = auto()
    COMPLETED = auto()

    @classmethod
    def rank_map(cls) -> list[tuple[str, int]]:
        return [(p.value, i) for i, p in enumerate(cls)]


class WorkOrderPriority(StrEnum):
    LOW = auto()
    MEDIUM = auto()
    HIGH = auto()
    URGENT = auto()

    @classmethod
    def rank_map(cls) -> list[tuple[str, int]]:
        return [(p.value, i) for i, p in enumerate(cls)]


VALID_TRANSITIONS: dict[WorkOrderStatus, set[WorkOrderStatus]] = {
    WorkOrderStatus.PENDING: {WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED},
    WorkOrderStatus.ASSIGNED: {WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED},
    WorkOrderStatus.IN_PROGRESS: {WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED},
    WorkOrderStatus.COMPLETED: set(),
    WorkOrderStatus.CANCELLED: set(),
}


class WorkOrder(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "work_orders"

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(WorkOrderStatus, native_enum=False, length=50),
        default=WorkOrderStatus.PENDING.value,
        server_default=WorkOrderStatus.PENDING.value,
        index=True,
    )
    priority: Mapped[str] = mapped_column(
        SAEnum(WorkOrderPriority, native_enum=False, length=50),
        default=WorkOrderPriority.MEDIUM.value,
        server_default=WorkOrderPriority.MEDIUM.value,
        index=True,
    )
    client_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True
    )
    technician_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("technicians.id", ondelete="SET NULL"), nullable=True, index=True
    )
    scheduled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    status_history: Mapped[list["WorkOrderStatusHistory"]] = relationship(
        "WorkOrderStatusHistory",
        back_populates="work_order",
        order_by="WorkOrderStatusHistory.created_at",
    )


class WorkOrderStatusHistory(UUIDMixin, Base):
    __tablename__ = "work_order_status_history"

    work_order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    from_status: Mapped[str | None] = mapped_column(
        SAEnum(WorkOrderStatus, native_enum=False, length=50), nullable=True
    )
    to_status: Mapped[str] = mapped_column(
        SAEnum(WorkOrderStatus, native_enum=False, length=50), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    work_order: Mapped["WorkOrder"] = relationship(
        "WorkOrder", back_populates="status_history"
    )
