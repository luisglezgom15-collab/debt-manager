def get_debt_data():
    person = input("Ingrese el nombre de la persona: ").strip()
    if not person:
        raise ValueError("El nombre de la persona no puede estar vacío.")
    amount = get_integer("Ingrese el monto de la deuda: ")
    if amount <= 0:
        raise ValueError("El monto de la deuda no puede ser cero o negativo.")
    paid = get_integer("Ingrese el monto pagado: ")
    if paid < 0:
        raise ValueError("El monto pagado no puede ser negativo.")
    return {
        "person": person,
        "amount": amount,
        "paid": paid,
    }

def get_integer(input_prompt):
    while True:
        try:
            return int(input(input_prompt))
        except ValueError:
            print("Por favor, ingrese un número entero válido.")
