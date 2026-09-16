from .inputs import get_debt_data, get_update_data, get_integer

from .debts import show_debts

from .database import add_debt as add_debt_db
from .database import delete_debt as delete_debt_db
from .database import update_debt as update_debt_db
from .database import get_debts

def show_menu():
    print("1. Mostrar deudas")
    print("2. Agregar deuda")
    print("3. Eliminar deuda")
    print("4. Actualizar deuda")
    print("5. Salir")

def execute_option(option):
    if option == "1":
        debts = get_debts()
        show_debts(debts)
        return False

    elif option == "2":
        add_debt_action()
        return False

    elif option == "3":
        delete_debt_action()
        return False

    elif option == "4":
        update_debt_action()
        return False

    elif option == "5":
        return True

    else:
        print("Opción inválida. Intente nuevamente.")
        return False

def add_debt_action():
    try:
        debt = get_debt_data()
    except ValueError as error:
        print(error)
        return

    add_debt_db(debt["person"], debt["amount"], debt["paid"])

    print(f"Deuda agregada para {debt['person']}: Monto = {debt['amount']}, Pagado = {debt['paid']}")

def delete_debt_action():
    debt_id = get_integer("Ingrese el id de la deuda: ")
    if delete_debt_db(debt_id):
        print(f"Deuda eliminada para {debt_id}")
    else:
        print(f"No se encontró ninguna deuda con el id: {debt_id}")

def update_debt_action():
    debt_id = get_integer("Ingrese el id de la deuda: ")
    if not debt_id:
        print("El id de la deuda no puede estar vacío.")
        return 
    try:
        update_data = get_update_data()
    except ValueError as error:
        print(error)
        return 
    if update_debt_db(debt_id, update_data["new_amount"], update_data["new_paid"]):
        print(f"Deuda con id: {debt_id} actualizada, Monto = {update_data['new_amount']}, Pagado = {update_data['new_paid']}")
    else:
        print(f"No se encontró ninguna deuda con el id: {debt_id}")

def main():

    while True:
        show_menu()

        option = input("Seleccione una opción: ")

        if execute_option(option):
            break

if __name__ == "__main__":
    main()
