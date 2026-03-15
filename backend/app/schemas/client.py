import uuid
from datetime import datetime

from pydantic import EmailStr

from app.schemas.base import AddressStr, CustomBaseModel, NameStr, PaginationMeta, PhoneStr


class ClientCreate(CustomBaseModel):
    name: NameStr
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    address: AddressStr | None = None


class ClientUpdate(CustomBaseModel):
    name: NameStr | None = None
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    address: AddressStr | None = None


class ClientRead(CustomBaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime


class ClientsResponse(CustomBaseModel):
    clients: list[ClientRead]
    meta: PaginationMeta
