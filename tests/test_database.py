from app.database import get_debts, add_debt, delete_debt, update_debt

import pytest

@pytest.fixture
def test_debt():
    add_debt("Test", 1000, 200, "debt_manager_test")
    debts = get_debts()

    TEST_ID = None

    for debt in debts:
        if debt["person"] == "Test":
           TEST_ID = debt["id"] 

    yield

    delete_debt(TEST_ID)

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

    delete_debt(ANA_ID)

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

    debts = get_debts()

    assert result
    assert not any(debt["id"] == ana_debt for debt in debts)