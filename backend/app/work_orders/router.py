import uuid

from fastapi import APIRouter, status

from app.core.dependencies import PaginationDep
from app.work_orders.dependencies import WorkOrderServiceDep
from app.work_orders.enums import WorkOrderPriority, WorkOrderStatus
from app.core.schemas import PaginationMeta, SortDir
from app.work_orders.schemas import (
    StatusTransitionRequest,
    WorkOrderCreate,
    WorkOrderRead,
    WorkOrderSortBy,
    WorkOrdersResponse,
    WorkOrderStatusHistoryRead,
    WorkOrderUpdate,
)

router = APIRouter(prefix="/work-orders", tags=["work-orders"])


@router.get("")
async def list_work_orders(
    pagination: PaginationDep,
    service: WorkOrderServiceDep,
    search: str | None = None,
    status: WorkOrderStatus | None = None,
    technician_id: uuid.UUID | None = None,
    client_id: uuid.UUID | None = None,
    priority: WorkOrderPriority | None = None,
    sort_by: WorkOrderSortBy = WorkOrderSortBy.CREATED_AT,
    sort_dir: SortDir = SortDir.DESC,
) -> WorkOrdersResponse:
    items, total = await service.list_work_orders(
        search=search,
        status=status,
        technician_id=technician_id,
        client_id=client_id,
        priority=priority,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return WorkOrdersResponse(
        work_orders=[WorkOrderRead.model_validate(item) for item in items],
        meta=PaginationMeta(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            items_count=len(items),
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_work_order(
    service: WorkOrderServiceDep,
    data: WorkOrderCreate,
) -> WorkOrderRead:
    return WorkOrderRead.model_validate(await service.create_work_order(data))


@router.get("/{work_order_id}")
async def get_work_order(
    work_order_id: uuid.UUID,
    service: WorkOrderServiceDep,
) -> WorkOrderRead:
    return WorkOrderRead.model_validate(await service.get_work_order(work_order_id))


@router.patch("/{work_order_id}")
async def update_work_order(
    work_order_id: uuid.UUID,
    service: WorkOrderServiceDep,
    data: WorkOrderUpdate,
) -> WorkOrderRead:
    return WorkOrderRead.model_validate(
        await service.update_work_order(work_order_id, data)
    )


@router.delete("/{work_order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(
    work_order_id: uuid.UUID,
    service: WorkOrderServiceDep,
) -> None:
    await service.delete_work_order(work_order_id)


@router.post("/{work_order_id}/transition")
async def transition_work_order_status(
    work_order_id: uuid.UUID,
    service: WorkOrderServiceDep,
    data: StatusTransitionRequest,
) -> WorkOrderRead:
    return WorkOrderRead.model_validate(
        await service.transition_status(work_order_id, data.to_status, data.notes)
    )


@router.get("/{work_order_id}/history")
async def get_work_order_history(
    work_order_id: uuid.UUID,
    service: WorkOrderServiceDep,
) -> list[WorkOrderStatusHistoryRead]:
    return [
        WorkOrderStatusHistoryRead.model_validate(h)
        for h in await service.get_work_order_history(work_order_id)
    ]
