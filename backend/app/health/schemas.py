from enum import StrEnum, auto

from app.core.schemas import CustomBaseModel


class HealthStatus(StrEnum):
    OK = auto()
    DEGRADED = auto()


class ComponentStatus(StrEnum):
    OK = auto()
    UNREACHABLE = auto()


class HealthRead(CustomBaseModel):
    status: HealthStatus
    db: ComponentStatus
