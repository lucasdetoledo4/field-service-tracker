from httpx import AsyncClient

from app.core.constants import API_PREFIX

CLIENTS = f"{API_PREFIX}/clients"


# --- Pagination ---

async def test_page_size_at_limit_is_accepted(client: AsyncClient):
    response = await client.get(CLIENTS, params={"page_size": 10_000})
    assert response.status_code == 200


async def test_page_size_above_limit_is_rejected(client: AsyncClient):
    response = await client.get(CLIENTS, params={"page_size": 10_001})
    assert response.status_code == 422


async def test_page_size_zero_is_rejected(client: AsyncClient):
    response = await client.get(CLIENTS, params={"page_size": 0})
    assert response.status_code == 422
TECHNICIANS = f"{API_PREFIX}/technicians"
WORK_ORDERS = f"{API_PREFIX}/work-orders"


# --- Clients ---

async def test_client_empty_name_is_rejected(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": ""})
    assert response.status_code == 422


async def test_client_whitespace_only_name_is_rejected(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "   "})
    assert response.status_code == 422


async def test_client_name_too_long_is_rejected(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "A" * 256})
    assert response.status_code == 422


async def test_client_invalid_email_is_rejected(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "Acme", "email": "notanemail"})
    assert response.status_code == 422


async def test_client_name_is_stripped(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "  Alice  "})
    assert response.status_code == 201
    assert response.json()["name"] == "Alice"


async def test_client_valid_email_is_accepted(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "Acme", "email": "acme@example.com"})
    assert response.status_code == 201


async def test_client_phone_too_long_is_rejected(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "Acme", "phone": "1" * 51})
    assert response.status_code == 422


async def test_client_address_too_long_is_rejected(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "Acme", "address": "A" * 501})
    assert response.status_code == 422


async def test_client_update_empty_name_is_rejected(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "Acme"})
    client_id = create.json()["id"]
    response = await client.patch(f"{CLIENTS}/{client_id}", json={"name": ""})
    assert response.status_code == 422


async def test_client_update_invalid_email_is_rejected(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "Acme"})
    client_id = create.json()["id"]
    response = await client.patch(f"{CLIENTS}/{client_id}", json={"email": "bad"})
    assert response.status_code == 422


# --- Technicians ---

async def test_technician_empty_name_is_rejected(client: AsyncClient):
    response = await client.post(TECHNICIANS, json={"name": ""})
    assert response.status_code == 422


async def test_technician_whitespace_only_name_is_rejected(client: AsyncClient):
    response = await client.post(TECHNICIANS, json={"name": "   "})
    assert response.status_code == 422


async def test_technician_invalid_email_is_rejected(client: AsyncClient):
    response = await client.post(TECHNICIANS, json={"name": "Bob", "email": "not-an-email"})
    assert response.status_code == 422


async def test_technician_name_is_stripped(client: AsyncClient):
    response = await client.post(TECHNICIANS, json={"name": "  Bob  "})
    assert response.status_code == 201
    assert response.json()["name"] == "Bob"


async def test_technician_specialty_too_long_is_rejected(client: AsyncClient):
    response = await client.post(TECHNICIANS, json={"name": "Bob", "specialty": "X" * 256})
    assert response.status_code == 422


async def test_technician_update_invalid_email_is_rejected(client: AsyncClient):
    create = await client.post(TECHNICIANS, json={"name": "Bob"})
    tech_id = create.json()["id"]
    response = await client.patch(f"{TECHNICIANS}/{tech_id}", json={"email": "bad@@"})
    assert response.status_code == 422


# --- Work Orders ---

async def test_work_order_empty_title_is_rejected(client: AsyncClient):
    response = await client.post(WORK_ORDERS, json={"title": ""})
    assert response.status_code == 422


async def test_work_order_whitespace_only_title_is_rejected(client: AsyncClient):
    response = await client.post(WORK_ORDERS, json={"title": "   "})
    assert response.status_code == 422


async def test_work_order_title_too_long_is_rejected(client: AsyncClient):
    response = await client.post(WORK_ORDERS, json={"title": "T" * 256})
    assert response.status_code == 422


async def test_work_order_title_is_stripped(client: AsyncClient):
    response = await client.post(WORK_ORDERS, json={"title": "  Fix HVAC  "})
    assert response.status_code == 201
    assert response.json()["title"] == "Fix HVAC"


async def test_work_order_empty_description_is_accepted(client: AsyncClient):
    response = await client.post(WORK_ORDERS, json={"title": "Fix HVAC", "description": ""})
    assert response.status_code == 201


async def test_work_order_update_empty_title_is_rejected(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "Fix HVAC"})
    wo_id = create.json()["id"]
    response = await client.patch(f"{WORK_ORDERS}/{wo_id}", json={"title": ""})
    assert response.status_code == 422
