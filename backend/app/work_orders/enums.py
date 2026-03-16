from enum import StrEnum, auto


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
