from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import async_session_maker
from app.schemas.health import ComponentStatus, HealthRead, HealthStatus

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthRead)
async def health() -> JSONResponse:
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        body = HealthRead(status=HealthStatus.ok, db=ComponentStatus.ok)
        return JSONResponse(body.model_dump(), status_code=200)
    except Exception:
        body = HealthRead(status=HealthStatus.degraded, db=ComponentStatus.unreachable)
        return JSONResponse(body.model_dump(), status_code=503)
