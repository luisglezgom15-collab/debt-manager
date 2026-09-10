def calculate_remaining(amount, paid):
    return amount - paid

def delete_debt(debts, person):
    for debt in debts:
        if debt["person"] == person:
            debts.remove(debt)
            return True
    return False

def update_debt(debts, person, new_amount, new_paid):
    for debt in debts:
        if debt["person"] == person:
            debt["amount"] = new_amount
            debt["paid"] = new_paid
            return True
    return False

def add_debt(debts, person, amount, paid):
    new_debt = {
        "person": person,
        "amount": amount,
        "paid": paid,
    }

    debts.append(new_debt)


def show_debts(debts):
    for person in debts:
        remaining_debt = calculate_remaining(
            person["amount"],
            person["paid"]
        )

        if remaining_debt > 0:
            print(f"{person['person']} debe todavía {remaining_debt}")

        elif remaining_debt == 0:
            print(f"{person['person']} ya ha pagado toda su deuda")

        else:
            print(
                f"{person['person']} ha pagado de más "
                f"y tiene un crédito de {-remaining_debt}"
            )

def get_debt_data():
    person = input("Ingrese el nombre de la persona: ").strip()
    if not person:
        raise ValueError("El nombre de la persona no puede estar vacío.")
    try:
        amount = int(input("Ingrese el monto de la deuda: "))
    except ValueError:
        raise ValueError("El monto de la deuda debe ser un número entero.")
    if amount <= 0:
        raise ValueError("El monto de la deuda no puede ser cero o negativo.")
    try:
        paid = int(input("Ingrese el monto pagado: "))
    except ValueError:
        raise ValueError("El monto pagado debe ser un número entero.")
    if paid < 0:
        raise ValueError("El monto pagado no puede ser negativo.")
    return {
        "person": person,
        "amount": amount,
        "paid": paid,
    }
