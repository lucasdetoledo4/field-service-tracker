import math
from enum import StrEnum, auto
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, computed_field


class SortDir(StrEnum):
    ASC = auto()
    DESC = auto()


NameStr = Annotated[
    str, StringConstraints(min_length=1, max_length=255, strip_whitespace=True)
]
PhoneStr = Annotated[
    str, StringConstraints(min_length=1, max_length=50, strip_whitespace=True)
]
AddressStr = Annotated[
    str, StringConstraints(min_length=1, max_length=500, strip_whitespace=True)
]
ShortStr = Annotated[
    str, StringConstraints(min_length=1, max_length=255, strip_whitespace=True)
]


class CustomBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PaginationMeta(CustomBaseModel):
    page: int
    page_size: int
    total: int
    items_count: int = Field(exclude=True)

    @computed_field
    @property
    def total_pages(self) -> int:
        return math.ceil(self.total / self.page_size) if self.page_size else 0

    @computed_field(alias="from")
    @property
    def from_(self) -> int:
        offset = (self.page - 1) * self.page_size
        return offset + 1 if self.total > 0 else 0

    @computed_field
    @property
    def to(self) -> int:
        return (self.page - 1) * self.page_size + self.items_count
