from httpx import AsyncClient

from app.core.constants import API_PREFIX

WORK_ORDERS = f"{API_PREFIX}/work-orders"


async def test_create_work_order(client: AsyncClient):
    response = await client.post(
        WORK_ORDERS, json={"title": "Fix HVAC", "priority": "high"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Fix HVAC"
    assert data["priority"] == "high"
    assert data["status"] == "pending"
    assert "id" in data


async def test_list_work_orders(client: AsyncClient):
    await client.post(WORK_ORDERS, json={"title": "WO 1"})
    await client.post(WORK_ORDERS, json={"title": "WO 2"})
    response = await client.get(WORK_ORDERS)
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 2
    assert len(data["work_orders"]) == 2
    assert data["meta"]["page"] == 1


async def test_list_work_orders_filter_status(client: AsyncClient):
    await client.post(WORK_ORDERS, json={"title": "Pending WO"})
    response = await client.get(WORK_ORDERS, params={"status": "pending"})
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 1
    assert data["work_orders"][0]["status"] == "pending"


async def test_list_work_orders_search(client: AsyncClient):
    await client.post(WORK_ORDERS, json={"title": "Fix HVAC unit"})
    await client.post(WORK_ORDERS, json={"title": "Replace boiler"})
    response = await client.get(WORK_ORDERS, params={"search": "hvac"})
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 1
    assert data["work_orders"][0]["title"] == "Fix HVAC unit"


async def test_list_work_orders_pagination(client: AsyncClient):
    for i in range(5):
        await client.post(WORK_ORDERS, json={"title": f"WO {i}"})
    response = await client.get(WORK_ORDERS, params={"page": 2, "page_size": 2})
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 5
    assert len(data["work_orders"]) == 2
    assert data["meta"]["page"] == 2
    assert data["meta"]["total_pages"] == 3


async def test_get_work_order(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "WO X"})
    wo_id = create.json()["id"]
    response = await client.get(f"{WORK_ORDERS}/{wo_id}")
    assert response.status_code == 200
    assert response.json()["id"] == wo_id


async def test_update_work_order(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "Old Title"})
    wo_id = create.json()["id"]
    response = await client.patch(f"{WORK_ORDERS}/{wo_id}", json={"title": "New Title"})
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"


async def test_delete_work_order(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "To Delete"})
    wo_id = create.json()["id"]
    response = await client.delete(f"{WORK_ORDERS}/{wo_id}")
    assert response.status_code == 204
    get_response = await client.get(f"{WORK_ORDERS}/{wo_id}")
    assert get_response.status_code == 404


async def test_valid_transition_pending_to_assigned(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "WO Transition"})
    wo_id = create.json()["id"]
    response = await client.post(
        f"{WORK_ORDERS}/{wo_id}/transition", json={"to_status": "assigned"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "assigned"


async def test_invalid_transition_returns_400(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "WO Invalid"})
    wo_id = create.json()["id"]
    response = await client.post(
        f"{WORK_ORDERS}/{wo_id}/transition", json={"to_status": "completed"}
    )
    assert response.status_code == 400


async def test_history_recorded_after_transition(client: AsyncClient):
    create = await client.post(WORK_ORDERS, json={"title": "WO History"})
    wo_id = create.json()["id"]
    await client.post(
        f"{WORK_ORDERS}/{wo_id}/transition",
        json={"to_status": "assigned", "notes": "Assigned to tech"},
    )
    response = await client.get(f"{WORK_ORDERS}/{wo_id}/history")
    assert response.status_code == 200
    history = response.json()
    assert len(history) == 1
    assert history[0]["from_status"] == "pending"
    assert history[0]["to_status"] == "assigned"
    assert history[0]["notes"] == "Assigned to tech"
