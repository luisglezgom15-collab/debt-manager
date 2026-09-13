import psycopg


def get_connection():
    return psycopg.connect(
        "dbname=debt_manager host=127.0.0.1 user=debt_app password=debt_password"
    )

def get_debts():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM debts")

    rows = cursor.fetchall()

    debts = []

    for row in rows:
        id, person, amount, paid = row

        debts.append({
            "id": id,
            "person": person,
            "amount": amount,
            "paid": paid
        })

    cursor.close()
    connection.close()

    return debts

def add_debt(person, amount, paid):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO debts (person, amount, paid) VALUES (%s, %s, %s)",
        (person, amount, paid)
    )

    connection.commit()

    cursor.close()
    connection.close()

def update_debt(person, new_amount, new_paid):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "UPDATE debts SET amount = %s, paid = %s WHERE person = %s",
        (new_amount, new_paid, person)
    )

    updated = cursor.rowcount

    connection.commit()

    cursor.close()
    connection.close()

    return updated > 0

def delete_debt(person):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM debts WHERE person = %s",
        (person,)
    )

    deleted = cursor.rowcount

    connection.commit()

    cursor.close()
    connection.close()

    return deleted > 0