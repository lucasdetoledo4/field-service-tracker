import uuid
from datetime import datetime

from pydantic import BaseModel


class ClientCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class ClientUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class ClientRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
