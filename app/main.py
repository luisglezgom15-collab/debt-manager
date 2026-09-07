from debts import show_debts, add_debt

debts = [
    {
        "person": "Juan",
        "amount": 5000,
        "paid": 1000,
    },
    {
        "person": "Maria",
        "amount": 8500,
        "paid": 2500,
    },
    {
        "person": "Pedro",
        "amount": 3000,
        "paid": 500,
    },
]

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

        print(f"Deuda agregada para {person}: Monto = {amount}, Pagado = {paid}")

    elif option == "3":
        person = input("Ingrese el nombre de la persona: ")
        for debt in debts:
            if debt["person"] == person:
                debts.remove(debt)
                print(f"Deuda eliminada para {person}")
                break
        else:
            print(f"No se encontró ninguna deuda para {person}")

    elif option == "4":
        person = input("Ingrese el nombre de la persona: ")
        for debt in debts:
            if debt["person"] == person:
                new_amount = int(input("Ingrese el nuevo monto de la deuda: "))
                new_paid = int(input("Ingrese el nuevo monto pagado: "))
                debt["amount"] = new_amount
                debt["paid"] = new_paid
                print(f"Deuda actualizada para {person}: Monto = {new_amount}, Pagado = {new_paid}")
                break
        else:
            print(f"No se encontró ninguna deuda para {person}")

    elif option == "5":
        break

    else:
        print("Opción inválida. Intente nuevamente.")

