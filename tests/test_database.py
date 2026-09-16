from app.database import get_debts, add_debt, delete_debt, update_debt, get_connection

import pytest

import psycopg

@pytest.fixture
def empty_test_db():
    with get_connection("debt_manager_test") as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM debts")

    yield

@pytest.fixture
def test_debt():
    add_debt("Test", 1000, 200, "debt_manager_test")
    debts = get_debts("debt_manager_test")

    TEST_ID = None

    for debt in debts:
        if debt["person"] == "Test":
           TEST_ID = debt["id"] 

    yield TEST_ID

    delete_debt(TEST_ID, "debt_manager_test")

def test_get_debts(test_debt):
    debts = get_debts("debt_manager_test")

    assert isinstance(debts, list)
    assert any(debt["person"] == "Test" for debt in debts)

@pytest.fixture
def ana_debt():
    add_debt("Ana", 5000, 1000, "debt_manager_test")
    debts = get_debts("debt_manager_test")

    ANA_ID = None

    for debt in debts:
        if debt["person"] == "Ana":
            ANA_ID = debt["id"] 

    yield ANA_ID

    delete_debt(ANA_ID, "debt_manager_test")

def test_add_debt(ana_debt):
    debts = get_debts("debt_manager_test")

    assert isinstance(debts, list)
    assert any(debt["person"] == "Ana" for debt in debts)

def test_update_debt(ana_debt):
    update_debt(ana_debt, 8000, 3000, "debt_manager_test")

    debts = get_debts("debt_manager_test")

    assert any(debt["person"] == "Ana" for debt in debts)
    assert any(debt["amount"] == 8000 and debt["person"] == "Ana" for debt in debts)
    assert any(debt["paid"] == 3000 and debt["person"] == "Ana" for debt in debts)

def test_delete_debt(ana_debt):
    result = delete_debt(ana_debt, "debt_manager_test")

    debts = get_debts("debt_manager_test")

    assert result
    assert not any(debt["id"] == ana_debt for debt in debts)

def test_update_debt_not_found():
    result = update_debt(99999900, 5000, 2000, "debt_manager_test")

    assert result is False

def test_delete_debt_not_found():
    result = delete_debt(99999900, "debt_manager_test")

    assert result is False

def test_get_debts_is_empty(empty_test_db):
    debts = get_debts("debt_manager_test")

    assert debts == []

def test_invalid_database_connection():
    with pytest.raises(psycopg.OperationalError):   
        get_connection("database_not_exist")

    