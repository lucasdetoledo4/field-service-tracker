from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Query


@dataclass
class PaginationParams:
    page: int = Query(default=1, ge=1, description="Page number (1-based)")
    page_size: int = Query(default=20, ge=1, le=10_000, description="Items per page (max 10 000; use cursor-based pagination beyond this)")

    @property
    def limit(self) -> int:
        return self.page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


PaginationDep = Annotated[PaginationParams, Depends(PaginationParams)]
