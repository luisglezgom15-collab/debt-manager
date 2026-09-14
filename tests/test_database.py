from app.database import get_debts, add_debt, delete_debt, update_debt

import pytest

@pytest.fixture
def test_debt():
    add_debt("Test", 1000, 200)

    yield

    delete_debt("Test")

def test_get_debts(test_debt):
    debts = get_debts()

    assert isinstance(debts, list)
    assert any(debt["person"] == "Test" for debt in debts)

@pytest.fixture
def ana_debt():
    add_debt("Ana", 5000, 1000)

    yield

    delete_debt("Ana")

def test_add_debt(ana_debt):
    debts = get_debts()

    assert isinstance(debts, list)
    assert any(debt["person"] == "Ana" for debt in debts)

def test_update_debt(ana_debt):
    update_debt("Ana", 8000, 3000)

    debts = get_debts()

    assert any(debt["person"] == "Ana" for debt in debts)
    assert any(debt["amount"] == 8000 and debt["person"] == "Ana" for debt in debts)
    assert any(debt["paid"] == 3000 and debt["person"] == "Ana" for debt in debts)

def test_delete_debt(ana_debt):
    result = delete_debt("Ana")

    debts = get_debts()

    assert result
    assert not any(debt["person"] == "Ana" for debt in debts)