from app.debts import calculate_remaining, show_debts
from app.inputs import get_debt_data, get_integer, get_update_data
from app.main import (
    execute_option,
    add_debt_action,
    main,
    show_menu,
    update_debt_action,
)
from app.database import delete_debt as delete_debt_db
from app.database import add_debt as add_debt_db
from app.database import get_debts

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


def test_get_debt_data(monkeypatch):
    inputs = iter(["Juan", "5000", "1000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    debt_data = get_debt_data()

    assert debt_data == {
        "person": "Juan",
        "amount": 5000,
        "paid": 1000,
    }


def test_get_debt_data_empty_person(monkeypatch):
    inputs = iter(["", "5000", "1000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_debt_data()

    assert str(excinfo.value) == "El nombre de la persona no puede estar vacío."


def test_get_debt_data_invalid_amount(monkeypatch):
    inputs = iter(["Juan", "0"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_debt_data()

    assert str(excinfo.value) == (
        "El monto de la deuda no puede ser cero o negativo."
    )


def test_get_debt_data_negative_amount(monkeypatch):
    inputs = iter(["Juan", "-500"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_debt_data()

    assert str(excinfo.value) == (
        "El monto de la deuda no puede ser cero o negativo."
    )


def test_get_debt_data_negative_paid(monkeypatch):
    inputs = iter(["Juan", "5000", "-100"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_debt_data()

    assert str(excinfo.value) == "El monto pagado no puede ser negativo."


def test_show_debts_remaining(capsys):
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 1000},
    ]

    show_debts(debts)

    captured = capsys.readouterr()
    assert "Juan debe todavía 4000" in captured.out


def test_show_debts_paid(capsys):
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 5000},
    ]

    show_debts(debts)

    captured = capsys.readouterr()
    assert "Juan ya ha pagado toda su deuda" in captured.out


def test_show_debts_overpaid(capsys):
    debts = [
        {"person": "Juan", "amount": 5000, "paid": 6000},
    ]

    show_debts(debts)

    captured = capsys.readouterr()
    assert "Juan ha pagado de más y tiene un crédito de 1000" in captured.out


def test_get_integer_invalid_input(monkeypatch, capsys):
    inputs = iter(["abc", "5000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    result = get_integer("Ingrese un número: ")

    captured = capsys.readouterr()
    assert "Por favor, ingrese un número entero válido." in captured.out
    assert result == 5000


def test_get_update_data(monkeypatch):
    inputs = iter(["6000", "2000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    update_data = get_update_data()

    assert update_data == {
        "new_amount": 6000,
        "new_paid": 2000,
    }


def test_get_update_data_zero_amount(monkeypatch):
    inputs = iter(["0", "2000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_update_data()

    assert str(excinfo.value) == (
        "El monto de la deuda no puede ser cero o negativo."
    )


def test_get_update_data_negative_amount(monkeypatch):
    inputs = iter(["-500", "2000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_update_data()

    assert str(excinfo.value) == (
        "El monto de la deuda no puede ser cero o negativo."
    )


def test_get_update_data_negative_paid(monkeypatch):
    inputs = iter(["6000", "-100"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    with pytest.raises(ValueError) as excinfo:
        get_update_data()

    assert str(excinfo.value) == "El monto pagado no puede ser negativo."


def test_get_update_data_invalid_input(monkeypatch, capsys):
    inputs = iter(["abc", "6000", "xyz", "2000"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    result = get_update_data()

    captured = capsys.readouterr()
    assert "Por favor, ingrese un número entero válido." in captured.out
    assert result == {
        "new_amount": 6000,
        "new_paid": 2000,
    }


def test_execute_option_exit():
    result = execute_option("5")

    assert result is True


def test_execute_option_show_debts():
    result = execute_option("1")

    assert result is False


def test_execute_option_invalid_option(capsys):
    result = execute_option("invalid")

    captured = capsys.readouterr()
    assert "Opción inválida. Intente nuevamente." in captured.out
    assert result is False


def test_execute_option_add_debt(monkeypatch):
    inputs = iter(["Juan", "5000", "1000"])

    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    execute_option("2")

    debts = get_debts()

    assert any(
        debt["person"] == "Juan"
        and debt["amount"] == 5000
        and debt["paid"] == 1000
        for debt in debts
    )

    delete_debt_db("Juan")


def test_execute_option_delete_debt(monkeypatch):
    add_debt_db("Juan", 5000, 1000)

    inputs = iter(["Juan"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    execute_option("3")

    debts = get_debts()

    assert not any(debt["person"] == "Juan" for debt in debts)


def test_execute_option_delete_debt_not_found(monkeypatch, capsys):
    add_debt_db("Juan", 5000, 1000)

    inputs = iter(["Pedro"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    result = execute_option("3")

    debts = get_debts()

    captured = capsys.readouterr()

    assert "No se encontró ninguna deuda para Pedro" in captured.out
    assert result is False
    assert any(debt["person"] == "Juan" for debt in debts)

    delete_debt_db("Juan")


def test_execute_option_update_debt(monkeypatch):
    add_debt_db("Juan", 5000, 1000)

    inputs = iter(["Juan", "7000", "2500"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    execute_option("4")

    debts = get_debts()

    assert any(
        debt["person"] == "Juan"
        and debt["amount"] == 7000
        and debt["paid"] == 2500
        for debt in debts
    )

    delete_debt_db("Juan")


def test_execute_option_update_debt_not_found(monkeypatch, capsys):
    add_debt_db("Juan", 5000, 1000)

    inputs = iter(["Pedro", "7000", "2500"])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    result = execute_option("4")

    debts = get_debts()

    captured = capsys.readouterr()

    assert "No se encontró ninguna deuda para Pedro" in captured.out
    assert result is False
    assert any(
        debt["person"] == "Juan"
        and debt["amount"] == 5000
        and debt["paid"] == 1000
        for debt in debts
    )

    delete_debt_db("Juan")


def test_execute_option_update_debt_empty_person(monkeypatch, capsys):
    inputs = iter([""])

    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    result = execute_option("4")

    captured = capsys.readouterr()

    assert "El nombre de la persona no puede estar vacío." in captured.out
    assert result is False


def test_show_menu(capsys):
    show_menu()

    captured = capsys.readouterr()

    assert "1. Mostrar deudas" in captured.out
    assert "2. Agregar deuda" in captured.out
    assert "3. Eliminar deuda" in captured.out
    assert "4. Actualizar deuda" in captured.out
    assert "5. Salir" in captured.out


def test_add_debt_action_value_error(monkeypatch, capsys):
    inputs = iter(["", "5000", "1000"])

    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    add_debt_action()

    captured = capsys.readouterr()

    assert "El nombre de la persona no puede estar vacío." in captured.out


def test_update_debt_action_value_error(monkeypatch, capsys):
    inputs = iter(["Juan", "-7000", "2500"])

    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    update_debt_action()

    captured = capsys.readouterr()

    assert "El monto de la deuda no puede ser cero o negativo." in captured.out


def test_main_exit(monkeypatch):
    monkeypatch.setattr("builtins.input", lambda _: "5")

    main()
