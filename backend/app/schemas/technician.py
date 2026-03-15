import uuid
from datetime import datetime

from app.schemas.base import CustomBaseModel, PaginationMeta


class TechnicianCreate(CustomBaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    specialty: str | None = None
    is_active: bool = True


class TechnicianUpdate(CustomBaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    specialty: str | None = None
    is_active: bool | None = None


class TechnicianRead(CustomBaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    specialty: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TechniciansResponse(CustomBaseModel):
    technicians: list[TechnicianRead]
    meta: PaginationMeta
