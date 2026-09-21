from fastapi.testclient import TestClient

from app.api import app, get_db

from app.database import add_debt, get_connection

import pytest

client = TestClient(app)

def override_get_db():
    return "debt_manager_test"

app.dependency_overrides[get_db] = override_get_db

def test_get_hello():
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello Debt Manager"}

@pytest.fixture
def empty_test_db():
    with get_connection(database="debt_manager_test") as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM debts")

    yield
    with get_connection(database="debt_manager_test") as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM debts")
    

def test_get_debts(empty_test_db):
    add_debt(
        "Test API",
        1000,
        100,
        database="debt_manager_test"
    )

    response = client.get("/debts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(debt["person"] == "Test API" for debt in response.json())

def test_get_debt_for_id(empty_test_db):
    debt = add_debt(
        "Test",
        1000,
        500,
        database="debt_manager_test"
    )

    debt_id = debt["id"]
    
    response = client.get(f"/debts/{debt_id}")
    assert response.status_code == 200
    assert response.json()["person"] == "Test"

def test_get_debt_for_id_not_found():
    response = client.get("/debts/99967999")
    assert response.status_code == 404

def test_create_debt(empty_test_db):
    response = client.post(
        "/debts",
        json={
            "person": "Robert",
            "amount": 2000,
            "paid": 300
        }
    )

    assert response.status_code == 201
    assert response.json()["person"] == "Robert"
    assert response.json()["amount"] == 2000
    assert response.json()["paid"] == 300

    response = client.get("/debts")

    assert any(
        debt["person"] == "Robert"
        for debt in response.json()
    )

def test_create_debt_invalid():
    response = client.post(
        "/debts",
        json={
            "person": "Rob",
            "amount": 5000,
            "paid": 6000
        }
    )

    assert response.status_code == 422

def test_update_debt(empty_test_db):
    debt = add_debt(
    "Update",
    1000,
    100,
    database="debt_manager_test"
    )

    debt_id = debt["id"]
        
    response = client.put(f"/debts/{debt_id}",json={"amount": 50000, "paid": 49000})

    assert response.status_code == 200
    assert response.json() is True

def test_update_debt_not_found():
    response = client.put(
        "/debts/99999999",
        json={"amount": 500, "paid": 100})

    assert response.status_code == 404
    assert response.json() == {"detail": "No se encontro ninguna deuda con ese ID"}

def test_delete_debt(empty_test_db):
    debt = add_debt(
    "Delete",
    1000,
    100,
    database="debt_manager_test"
    )

    debt_id = debt["id"]

    response_delete = client.delete(f"/debts/{debt_id}")

    assert response_delete.status_code == 200

    response = client.get(f"/debts/{debt_id}")

    assert response.status_code == 404

def test_delete_debt_not_found():
    response = client.delete("/debts/99999999")

    assert response.status_code == 404