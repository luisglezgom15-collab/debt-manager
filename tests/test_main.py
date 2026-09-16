from app.main import delete_debt_action

from unittest.mock import patch 

@patch("app.main.delete_debt_db")
@patch("app.main.get_integer")
def test_delete_debt_action_success(mock_get_integer, mock_delete_debt, capsys):
    
    mock_get_integer.return_value = 10
    mock_delete_debt.return_value = True

    delete_debt_action()
    captured = capsys.readouterr()

    assert "Deuda eliminada para 10" in captured.out
    mock_delete_debt.assert_called_once_with(10)

@patch("app.main.delete_debt_db")
@patch("app.main.get_integer")
def test_delete_debt_action_not_found(mock_get_integer, mock_delete_debt, capsys):

    mock_get_integer.return_value = 55
    mock_delete_debt.return_value = False

    delete_debt_action()
    captured = capsys.readouterr()

    assert "No se encontró ninguna deuda con el id: 55" in captured.out
    mock_delete_debt.assert_called_once_with(55)