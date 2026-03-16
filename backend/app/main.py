import time
import uuid

import sentry_sdk
from fastapi import APIRouter, FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, JSONResponse, Response
from loguru import logger
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from app.core.config import settings
from app.core.constants import API_PREFIX
from app.core.exceptions import AppError, InvalidTransitionError, NotFoundError
from app.core.errors import ErrorResponse, FieldError
from app.core.logging import configure_logging
from app.clients.router import router as clients_router
from app.health.router import router as health_router
from app.technicians.router import router as technicians_router
from app.work_orders.router import router as work_orders_router

configure_logging()

if settings.SENTRY_DSN:
    _ = sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[StarletteIntegration(), FastApiIntegration()],
        traces_sample_rate=1.0,
    )

app = FastAPI(
    title="Field Service Tracker",
    swagger_ui_parameters={
        "docExpansion": "none",
        "filter": True,
        "tagsSorter": "alpha",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix=API_PREFIX)
api_router.include_router(clients_router)
api_router.include_router(technicians_router)
api_router.include_router(work_orders_router)
app.include_router(api_router)
app.include_router(health_router)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: object) -> Response:
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start = time.perf_counter()
    response: Response = await call_next(request)  # type: ignore[operator]
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        request_id=request_id,
    )
    response.headers["X-Request-ID"] = request_id
    return response


@app.get("/scalar", include_in_schema=False)
async def scalar_ui() -> HTMLResponse:
    return HTMLResponse("""<!DOCTYPE html>
<html>
<head>
  <title>Field Service Tracker — API Reference</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script
    id="api-reference"
    data-url="/openapi.json"
    data-configuration='{"theme":"purple","layout":"modern"}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>""")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [
        FieldError(
            field=".".join(str(loc) for loc in err["loc"]),
            message=err["msg"],
        )
        for err in exc.errors()
    ]
    body = ErrorResponse(detail="Validation failed", errors=errors)
    return JSONResponse(status_code=422, content=body.model_dump())


@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(InvalidTransitionError)
async def invalid_transition_handler(
    request: Request, exc: InvalidTransitionError
) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    sentry_sdk.capture_exception(exc)
    return JSONResponse(
        status_code=500, content={"detail": "An unexpected error occurred"}
    )
