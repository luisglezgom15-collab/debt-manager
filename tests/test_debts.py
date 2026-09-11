from app.debts import add_debt, calculate_remaining, delete_debt, update_debt

from app.storage import load_debts_from_json, save_debts_to_json

import json
import pytest

def test_calculate_remaining():
    resultado = calculate_remaining(5000, 1000)

    assert resultado == 4000

def test_calculate_remaining_cero():
    resultado = calculate_remaining(5000, 5000)

    assert resultado == 0

def test_calculate_remaining_negativo():
    resultado = calculate_remaining(5000, 6000)

    assert resultado == -1000

def test_add_debt():
    debts = []
    add_debt(debts, "Juan", 5000, 1000)

    assert len(debts) == 1
    assert debts[0]["person"] == "Juan"
    assert debts[0]["amount"] == 5000
    assert debts[0]["paid"] == 1000

def test_delete_debt():
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
       
    ]
    result = delete_debt(debts, "Juan")

    assert result is True
    assert len(debts) == 0

def test_delete_debt_not_found():
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
    ]
    result = delete_debt(debts, "Pedro")

    assert result is False
    assert len(debts) == 1

def test_update_debt():
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
    ]
    result = update_debt(debts, "Juan", 6000, 2000)

    assert result is True
    assert debts[0]["amount"] == 6000
    assert debts[0]["paid"] == 2000

def test_update_debt_not_found():
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
    ]
    result = update_debt(debts, "Pedro", 6000, 2000)

    assert result is False
    assert debts[0]["amount"] == 5000
    assert debts[0]["paid"] == 1000

def test_save_debts_to_json(tmp_path):
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
    ]
    file_path = tmp_path / "test_debts.json"
    save_debts_to_json(debts, str(file_path))

    assert file_path.exists()

def test_save_and_load_debts(tmp_path):
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
    ]
    file_path = tmp_path / "test_debts.json"
    save_debts_to_json(debts, str(file_path))

    loaded_debts = load_debts_from_json(str(file_path))

    assert loaded_debts == debts

def test_load_debts_from_json_file_not_found(tmp_path):
    file_path = tmp_path / "non_existent_file.json"
    loaded_debts = load_debts_from_json(str(file_path))

    assert loaded_debts == []

def test_load_debts_from_json_invalid_json(tmp_path):
    file_path = tmp_path / "invalid.json"
    file_path.write_text("invalid json")

    with pytest.raises(json.JSONDecodeError):
        load_debts_from_json(str(file_path))
