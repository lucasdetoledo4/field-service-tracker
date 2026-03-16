from httpx import AsyncClient

from app.core.constants import API_PREFIX

CLIENTS = f"{API_PREFIX}/clients"
WORK_ORDERS = f"{API_PREFIX}/work-orders"


async def test_422_detail_is_string(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": ""})
    assert response.status_code == 422
    data = response.json()
    assert isinstance(data["detail"], str)
    assert data["detail"] == "Validation failed"


async def test_422_has_errors_array(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": ""})
    assert response.status_code == 422
    data = response.json()
    assert "errors" in data
    assert isinstance(data["errors"], list)
    assert len(data["errors"]) > 0


async def test_422_error_has_field_and_message(client: AsyncClient):
    response = await client.post(CLIENTS, json={"name": ""})
    assert response.status_code == 422
    error = response.json()["errors"][0]
    assert "field" in error
    assert "message" in error
    assert isinstance(error["field"], str)
    assert isinstance(error["message"], str)


async def test_404_detail_is_string(client: AsyncClient):
    response = await client.get(f"{CLIENTS}/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    data = response.json()
    assert isinstance(data["detail"], str)
    assert "errors" not in data


async def test_400_detail_is_string(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "WO"})
    wo_id = create.json()["id"]
    response = await client.post(
        f"{WORK_ORDERS}/{wo_id}/transition", json={"to_status": "completed"}
    )
    assert response.status_code == 400
    data = response.json()
    assert isinstance(data["detail"], str)
    assert "errors" not in data
