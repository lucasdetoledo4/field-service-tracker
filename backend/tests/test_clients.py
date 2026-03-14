import pytest
from httpx import AsyncClient

from app.constants import API_PREFIX

CLIENTS = f"{API_PREFIX}/clients"


async def test_create_client(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "Acme Corp", "email": "acme@example.com"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Corp"
    assert data["email"] == "acme@example.com"
    assert "id" in data


async def test_list_clients(client: AsyncClient):
    await client.post(CLIENTS, json={"name": "Client A"})
    await client.post(CLIENTS, json={"name": "Client B"})
    response = await client.get(CLIENTS)
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_client(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "Client X"})
    client_id = create.json()["id"]
    response = await client.get(f"{CLIENTS}/{client_id}")
    assert response.status_code == 200
    assert response.json()["id"] == client_id


async def test_update_client(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "Old Name"})
    client_id = create.json()["id"]
    response = await client.patch(f"{CLIENTS}/{client_id}", json={"name": "New Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


async def test_delete_client(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "To Delete"})
    client_id = create.json()["id"]
    response = await client.delete(f"{CLIENTS}/{client_id}")
    assert response.status_code == 204
    get_response = await client.get(f"{CLIENTS}/{client_id}")
    assert get_response.status_code == 404


async def test_get_client_not_found(client: AsyncClient):
    response = await client.get(f"{CLIENTS}/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
