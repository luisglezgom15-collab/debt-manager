from .inputs import get_debt_data, get_update_data

from .debts import show_debts, add_debt, delete_debt, update_debt

from .storage import load_debts_from_json, save_debts_to_json

def show_menu():
    print("1. Mostrar deudas")
    print("2. Agregar deuda")
    print("3. Eliminar deuda")
    print("4. Actualizar deuda")
    print("5. Salir")

def execute_option(option, debts):
    if option == "1":
        show_debts(debts)
        return False

    elif option == "2":
        add_debt_action(debts)
        return False

    elif option == "3":
        delete_debt_action(debts)
        return False

    elif option == "4":
        update_debt_action(debts)
        return False

    elif option == "5":
        return True

    else:
        print("Opción inválida. Intente nuevamente.")
        return False

def add_debt_action(debts):
    try:
        debt = get_debt_data()
    except ValueError as error:
        print(error)
        return

    add_debt(debts, debt["person"], debt["amount"], debt["paid"])
    save_debts_to_json(debts)

    print(f"Deuda agregada para {debt['person']}: Monto = {debt['amount']}, Pagado = {debt['paid']}")

def delete_debt_action(debts):
    person = input("Ingrese el nombre de la persona: ").strip()
    if delete_debt(debts, person):
        save_debts_to_json(debts)
        print(f"Deuda eliminada para {person}")
    else:
        print(f"No se encontró ninguna deuda para {person}")

def update_debt_action(debts):
    person = input("Ingrese el nombre de la persona: ")
    if not person:
        print("El nombre de la persona no puede estar vacío.")
        return 
    try:
        update_data = get_update_data()
    except ValueError as error:
        print(error)
        return 
    if update_debt(debts, person, update_data["new_amount"], update_data["new_paid"]):
        save_debts_to_json(debts)
        print(f"Deuda actualizada para {person}: Monto = {update_data['new_amount']}, Pagado = {update_data['new_paid']}")
    else:
        print(f"No se encontró ninguna deuda para {person}")

def main():
    debts = load_debts_from_json()

    while True:
        show_menu()

        option = input("Seleccione una opción: ")

        if execute_option(option, debts):
            break

if __name__ == "__main__":
    main()
