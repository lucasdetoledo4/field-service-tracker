import uuid
from datetime import datetime

from pydantic import BaseModel


class TechnicianCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    specialty: str | None = None
    is_active: bool = True


class TechnicianUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    specialty: str | None = None
    is_active: bool | None = None


class TechnicianRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    specialty: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
