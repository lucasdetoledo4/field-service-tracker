from enum import StrEnum

from app.schemas.base import CustomBaseModel


class HealthStatus(StrEnum):
    ok = "ok"
    degraded = "degraded"


class ComponentStatus(StrEnum):
    ok = "ok"
    unreachable = "unreachable"


class HealthRead(CustomBaseModel):
    status: HealthStatus
    db: ComponentStatus
