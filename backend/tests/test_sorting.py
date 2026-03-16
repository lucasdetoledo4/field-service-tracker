import uuid
from datetime import datetime, timezone

from httpx import AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import API_PREFIX
from app.clients.models import Client
from app.work_orders.models import WorkOrder

CLIENTS = f"{API_PREFIX}/clients"
TECHNICIANS = f"{API_PREFIX}/technicians"
WORK_ORDERS = f"{API_PREFIX}/work-orders"
C_REQ = {"email": "test@example.com", "phone": "+15550100000"}
T_REQ = {"email": "test@example.com", "phone": "+15550200000"}


# --- Clients ---

async def test_clients_sort_by_name_asc(client: AsyncClient):
    await client.post(CLIENTS, json={"name": "Zebra Corp", **C_REQ})
    await client.post(CLIENTS, json={"name": "Acme Inc", **C_REQ})
    response = await client.get(CLIENTS, params={"sort_by": "name", "sort_dir": "asc"})
    assert response.status_code == 200
    names = [c["name"] for c in response.json()["clients"]]
    assert names == sorted(names)


async def test_clients_sort_by_name_desc(client: AsyncClient):
    await client.post(CLIENTS, json={"name": "Acme Inc", **C_REQ})
    await client.post(CLIENTS, json={"name": "Zebra Corp", **C_REQ})
    response = await client.get(CLIENTS, params={"sort_by": "name", "sort_dir": "desc"})
    assert response.status_code == 200
    names = [c["name"] for c in response.json()["clients"]]
    assert names == sorted(names, reverse=True)


async def test_clients_invalid_sort_by_returns_422(client: AsyncClient):
    response = await client.get(CLIENTS, params={"sort_by": "nonexistent"})
    assert response.status_code == 422


async def test_clients_invalid_sort_dir_returns_422(client: AsyncClient):
    response = await client.get(CLIENTS, params={"sort_dir": "sideways"})
    assert response.status_code == 422


async def test_clients_default_sort_is_created_at_desc(client: AsyncClient, db: AsyncSession):
    r1 = await client.post(CLIENTS, json={"name": "First", **C_REQ})
    r2 = await client.post(CLIENTS, json={"name": "Second", **C_REQ})
    await db.execute(
        update(Client)
        .where(Client.id == uuid.UUID(r1.json()["id"]))
        .values(created_at=datetime(2024, 1, 1, tzinfo=timezone.utc))
    )
    await db.execute(
        update(Client)
        .where(Client.id == uuid.UUID(r2.json()["id"]))
        .values(created_at=datetime(2024, 1, 2, tzinfo=timezone.utc))
    )
    await db.commit()
    response = await client.get(CLIENTS)
    assert response.status_code == 200
    assert response.json()["clients"][0]["name"] == "Second"


# --- Technicians ---

async def test_technicians_sort_by_name_asc(client: AsyncClient):
    await client.post(TECHNICIANS, json={"name": "Zara", **T_REQ})
    await client.post(TECHNICIANS, json={"name": "Alice", **T_REQ})
    response = await client.get(TECHNICIANS, params={"sort_by": "name", "sort_dir": "asc"})
    assert response.status_code == 200
    names = [t["name"] for t in response.json()["technicians"]]
    assert names == sorted(names)


async def test_technicians_sort_by_name_desc(client: AsyncClient):
    await client.post(TECHNICIANS, json={"name": "Alice", **T_REQ})
    await client.post(TECHNICIANS, json={"name": "Zara", **T_REQ})
    response = await client.get(TECHNICIANS, params={"sort_by": "name", "sort_dir": "desc"})
    assert response.status_code == 200
    names = [t["name"] for t in response.json()["technicians"]]
    assert names == sorted(names, reverse=True)


async def test_technicians_invalid_sort_by_returns_422(client: AsyncClient):
    response = await client.get(TECHNICIANS, params={"sort_by": "email"})
    assert response.status_code == 422


# --- Work Orders ---

async def test_work_orders_sort_by_title_asc(client: AsyncClient):
    await client.post(WORK_ORDERS, json={"title": "Zebra job"})
    await client.post(WORK_ORDERS, json={"title": "Alpha job"})
    response = await client.get(WORK_ORDERS, params={"sort_by": "title", "sort_dir": "asc"})
    assert response.status_code == 200
    titles = [wo["title"] for wo in response.json()["work_orders"]]
    assert titles == sorted(titles)


async def test_work_orders_sort_by_title_desc(client: AsyncClient):
    await client.post(WORK_ORDERS, json={"title": "Alpha job"})
    await client.post(WORK_ORDERS, json={"title": "Zebra job"})
    response = await client.get(WORK_ORDERS, params={"sort_by": "title", "sort_dir": "desc"})
    assert response.status_code == 200
    titles = [wo["title"] for wo in response.json()["work_orders"]]
    assert titles == sorted(titles, reverse=True)


async def test_work_orders_invalid_sort_by_returns_422(client: AsyncClient):
    response = await client.get(WORK_ORDERS, params={"sort_by": "nonexistent"})
    assert response.status_code == 422


async def test_work_orders_default_sort_is_created_at_desc(client: AsyncClient, db: AsyncSession):
    r1 = await client.post(WORK_ORDERS, json={"title": "First"})
    r2 = await client.post(WORK_ORDERS, json={"title": "Second"})
    await db.execute(
        update(WorkOrder)
        .where(WorkOrder.id == uuid.UUID(r1.json()["id"]))
        .values(created_at=datetime(2024, 1, 1, tzinfo=timezone.utc))
    )
    await db.execute(
        update(WorkOrder)
        .where(WorkOrder.id == uuid.UUID(r2.json()["id"]))
        .values(created_at=datetime(2024, 1, 2, tzinfo=timezone.utc))
    )
    await db.commit()
    response = await client.get(WORK_ORDERS)
    assert response.status_code == 200
    assert response.json()["work_orders"][0]["title"] == "Second"


