import math
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


class SortDir(StrEnum):
    asc = "asc"
    desc = "desc"

NameStr    = Annotated[str, StringConstraints(min_length=1, max_length=255, strip_whitespace=True)]
PhoneStr   = Annotated[str, StringConstraints(min_length=1, max_length=50,  strip_whitespace=True)]
AddressStr = Annotated[str, StringConstraints(min_length=1, max_length=500, strip_whitespace=True)]
ShortStr   = Annotated[str, StringConstraints(min_length=1, max_length=255, strip_whitespace=True)]


class CustomBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PaginationMeta(CustomBaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int
    from_: int = Field(alias="from")
    to: int

    @classmethod
    def build(cls, *, page: int, page_size: int, total: int, items_count: int) -> "PaginationMeta":
        offset = (page - 1) * page_size
        return cls(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=math.ceil(total / page_size) if page_size else 0,
            from_=offset + 1 if total > 0 else 0,
            to=offset + items_count,
        )
