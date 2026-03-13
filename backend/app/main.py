from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.clients import router as clients_router
from app.routers.technicians import router as technicians_router
from app.routers.work_orders import router as work_orders_router

app = FastAPI(title="Field Service Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients_router)
app.include_router(technicians_router)
app.include_router(work_orders_router)
