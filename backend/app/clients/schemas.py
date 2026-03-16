import uuid
from datetime import datetime
from enum import StrEnum, auto

from pydantic import EmailStr

from app.core.schemas import AddressStr, CustomBaseModel, NameStr, PaginationMeta, PhoneStr


class ClientSortBy(StrEnum):
    NAME = auto()
    CREATED_AT = auto()


class ClientCreate(CustomBaseModel):
    name: NameStr
    email: EmailStr
    phone: PhoneStr
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
