import uuid
from datetime import datetime

from pydantic import EmailStr

from app.schemas.base import CustomBaseModel, NameStr, PaginationMeta, PhoneStr, ShortStr


class TechnicianCreate(CustomBaseModel):
    name: NameStr
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    specialty: ShortStr | None = None
    is_active: bool = True


class TechnicianUpdate(CustomBaseModel):
    name: NameStr | None = None
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    specialty: ShortStr | None = None
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
