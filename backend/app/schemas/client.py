import uuid
from datetime import datetime

from app.schemas.base import CustomBaseModel


class ClientCreate(CustomBaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class ClientUpdate(CustomBaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class ClientRead(CustomBaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime
