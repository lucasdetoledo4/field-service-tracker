import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies import PaginationParams, get_work_order_service
from app.models.work_order import WorkOrderPriority, WorkOrderStatus
from app.schemas.base import PaginationMeta
from app.schemas.work_order import (
    StatusTransitionRequest,
    WorkOrderCreate,
    WorkOrderRead,
    WorkOrderStatusHistoryRead,
    WorkOrderUpdate,
    WorkOrdersResponse,
)
from app.services.work_order import WorkOrderService

router = APIRouter(prefix="/work-orders", tags=["work-orders"])


@router.get("")
async def list_work_orders(
    search: str | None = None,
    status: WorkOrderStatus | None = None,
    technician_id: uuid.UUID | None = None,
    client_id: uuid.UUID | None = None,
    priority: WorkOrderPriority | None = None,
    pagination: PaginationParams = Depends(PaginationParams),
    service: WorkOrderService = Depends(get_work_order_service),
) -> WorkOrdersResponse:
    items, total = await service.list_work_orders(
        search=search,
        status=status,
        technician_id=technician_id,
        client_id=client_id,
        priority=priority,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return WorkOrdersResponse(
        work_orders=items,
        meta=PaginationMeta.build(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            items_count=len(items),
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_work_order(
    data: WorkOrderCreate,
    service: WorkOrderService = Depends(get_work_order_service),
) -> WorkOrderRead:
    return await service.create_work_order(data)


@router.get("/{work_order_id}")
async def get_work_order(
    work_order_id: uuid.UUID,
    service: WorkOrderService = Depends(get_work_order_service),
) -> WorkOrderRead:
    return await service.get_work_order(work_order_id)


@router.patch("/{work_order_id}")
async def update_work_order(
    work_order_id: uuid.UUID,
    data: WorkOrderUpdate,
    service: WorkOrderService = Depends(get_work_order_service),
) -> WorkOrderRead:
    return await service.update_work_order(work_order_id, data)


@router.delete("/{work_order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(
    work_order_id: uuid.UUID,
    service: WorkOrderService = Depends(get_work_order_service),
) -> None:
    await service.delete_work_order(work_order_id)


@router.post("/{work_order_id}/transition")
async def transition_work_order_status(
    work_order_id: uuid.UUID,
    data: StatusTransitionRequest,
    service: WorkOrderService = Depends(get_work_order_service),
) -> WorkOrderRead:
    return await service.transition_status(work_order_id, data.to_status, data.notes)


@router.get("/{work_order_id}/history")
async def get_work_order_history(
    work_order_id: uuid.UUID,
    service: WorkOrderService = Depends(get_work_order_service),
) -> list[WorkOrderStatusHistoryRead]:
    return await service.get_work_order_history(work_order_id)
