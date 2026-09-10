from debts import show_debts, add_debt, delete_debt, update_debt

from storage import load_debts_from_json, save_debts_to_json

debts = load_debts_from_json()

while True:
    print("1. Mostrar deudas")
    print("2. Agregar deuda")
    print("3. Eliminar deuda")
    print("4. Actualizar deuda")
    print("5. Salir")

    option = input("Seleccione una opción: ")

    if option == "1":
        show_debts(debts)

    elif option == "2":
        person = input("Ingrese el nombre de la persona: ")
        amount = int(input("Ingrese el monto de la deuda: "))
        paid = int(input("Ingrese el monto pagado: "))

        add_debt(debts, person, amount, paid)
        save_debts_to_json(debts)

        print(f"Deuda agregada para {person}: Monto = {amount}, Pagado = {paid}")

    elif option == "3":
        person = input("Ingrese el nombre de la persona: ")
        if delete_debt(debts, person):
            save_debts_to_json(debts)
            print(f"Deuda eliminada para {person}")
        else:
            print(f"No se encontró ninguna deuda para {person}")

    elif option == "4":
        person = input("Ingrese el nombre de la persona: ")
        new_amount = int(input("Ingrese el nuevo monto de la deuda: "))
        new_paid = int(input("Ingrese el nuevo monto pagado: "))
        if update_debt(debts, person, new_amount, new_paid):
            save_debts_to_json(debts)
            print(f"Deuda actualizada para {person}: Monto = {new_amount}, Pagado = {new_paid}")
        else:
            print(f"No se encontró ninguna deuda para {person}")

    elif option == "5":
        break

    else:
        print("Opción inválida. Intente nuevamente.")

