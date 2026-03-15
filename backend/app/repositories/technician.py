import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.technician import Technician
from app.schemas.base import SortDir
from app.schemas.technician import TechnicianCreate, TechnicianSortBy, TechnicianUpdate


class TechnicianRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(
        self,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: TechnicianSortBy = TechnicianSortBy.CREATED_AT,
        sort_dir: SortDir = SortDir.DESC,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Technician], int]:
        stmt = select(Technician)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(Technician.name.ilike(pattern), Technician.email.ilike(pattern))
            )
        if is_active is not None:
            stmt = stmt.where(Technician.is_active == is_active)

        total = (
            await self.db.execute(select(func.count()).select_from(stmt.subquery()))
        ).scalar_one()

        col = getattr(Technician, sort_by)
        order_col = col.asc() if sort_dir == SortDir.ASC else col.desc()
        items = list(
            (
                await self.db.execute(
                    stmt.order_by(order_col).limit(limit).offset(offset)
                )
            )
            .scalars()
            .all()
        )
        return items, total

    async def get_by_id(self, id: uuid.UUID) -> Technician | None:
        result = await self.db.execute(select(Technician).where(Technician.id == id))
        return result.scalar_one_or_none()

    async def create(self, data: TechnicianCreate) -> Technician:
        technician = Technician(**data.model_dump())
        self.db.add(technician)
        await self.db.commit()
        await self.db.refresh(technician)
        return technician

    async def update(self, technician: Technician, data: TechnicianUpdate) -> Technician:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(technician, key, value)
        await self.db.commit()
        await self.db.refresh(technician)
        return technician

    async def delete(self, technician: Technician) -> None:
        await self.db.delete(technician)
        await self.db.commit()
