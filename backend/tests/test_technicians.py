import pytest
from httpx import AsyncClient

from app.constants import API_PREFIX

TECHNICIANS = f"{API_PREFIX}/technicians"


async def test_create_technician(client: AsyncClient):
    response = await client.post(
        TECHNICIANS,
        json={"name": "Jane Doe", "email": "jane@example.com", "specialty": "HVAC"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert data["specialty"] == "HVAC"
    assert data["is_active"] is True
    assert "id" in data


async def test_list_technicians(client: AsyncClient):
    await client.post(TECHNICIANS, json={"name": "Tech A"})
    await client.post(TECHNICIANS, json={"name": "Tech B"})
    response = await client.get(TECHNICIANS)
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_technician(client: AsyncClient):
    create = await client.post(TECHNICIANS, json={"name": "Tech X"})
    technician_id = create.json()["id"]
    response = await client.get(f"{TECHNICIANS}/{technician_id}")
    assert response.status_code == 200
    assert response.json()["id"] == technician_id


async def test_update_technician(client: AsyncClient):
    create = await client.post(TECHNICIANS, json={"name": "Old Name"})
    technician_id = create.json()["id"]
    response = await client.patch(f"{TECHNICIANS}/{technician_id}", json={"name": "New Name", "is_active": False})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["is_active"] is False


async def test_delete_technician(client: AsyncClient):
    create = await client.post(TECHNICIANS, json={"name": "To Delete"})
    technician_id = create.json()["id"]
    response = await client.delete(f"{TECHNICIANS}/{technician_id}")
    assert response.status_code == 204
    get_response = await client.get(f"{TECHNICIANS}/{technician_id}")
    assert get_response.status_code == 404


async def test_get_technician_not_found(client: AsyncClient):
    response = await client.get(f"{TECHNICIANS}/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
