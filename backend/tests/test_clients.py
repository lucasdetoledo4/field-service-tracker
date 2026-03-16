from httpx import AsyncClient

from app.core.constants import API_PREFIX

CLIENTS = f"{API_PREFIX}/clients"
REQ = {"email": "test@example.com", "phone": "+15550100000"}


async def test_create_client(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": "Acme Corp", "email": "acme@example.com", "phone": "+15550100001"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Corp"
    assert data["email"] == "acme@example.com"
    assert "id" in data


async def test_list_clients(client: AsyncClient):
    await client.post(CLIENTS, json={"name": "Client A", **REQ})
    await client.post(CLIENTS, json={"name": "Client B", **REQ})
    response = await client.get(CLIENTS)
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 2
    assert len(data["clients"]) == 2
    assert data["meta"]["page"] == 1


async def test_list_clients_search(client: AsyncClient):
    await client.post(CLIENTS, json={"name": "Acme Corp", "email": "acme@example.com", "phone": "+15550100001"})
    await client.post(CLIENTS, json={"name": "Beta LLC", **REQ})
    response = await client.get(CLIENTS, params={"search": "acme"})
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 1
    assert data["clients"][0]["name"] == "Acme Corp"


async def test_list_clients_pagination(client: AsyncClient):
    for i in range(5):
        await client.post(CLIENTS, json={"name": f"Client {i}", **REQ})
    response = await client.get(CLIENTS, params={"page": 1, "page_size": 3})
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 5
    assert len(data["clients"]) == 3
    assert data["meta"]["total_pages"] == 2


async def test_get_client(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "Client X", **REQ})
    client_id = create.json()["id"]
    response = await client.get(f"{CLIENTS}/{client_id}")
    assert response.status_code == 200
    assert response.json()["id"] == client_id


async def test_update_client(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "Old Name", **REQ})
    client_id = create.json()["id"]
    response = await client.patch(f"{CLIENTS}/{client_id}", json={"name": "New Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


async def test_delete_client(client: AsyncClient):
    create = await client.post(CLIENTS, json={"name": "To Delete", **REQ})
    client_id = create.json()["id"]
    response = await client.delete(f"{CLIENTS}/{client_id}")
    assert response.status_code == 204
    get_response = await client.get(f"{CLIENTS}/{client_id}")
    assert get_response.status_code == 404


async def test_get_client_not_found(client: AsyncClient):
    response = await client.get(f"{CLIENTS}/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
