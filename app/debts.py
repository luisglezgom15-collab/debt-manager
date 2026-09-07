def calculate_remaining(amount, paid):
    return amount - paid


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