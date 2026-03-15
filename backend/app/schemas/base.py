import math

from pydantic import BaseModel, ConfigDict, Field


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
