import psycopg


def get_connection():
    return psycopg.connect(
        "dbname=debt_manager host=127.0.0.1 user=debt_app password=debt_password"
    )

def get_debts():
    with get_connection() as connection:
        with connection.cursor() as cursor:

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

    return debts

def add_debt(person, amount, paid):
    with get_connection() as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "INSERT INTO debts (person, amount, paid) VALUES (%s, %s, %s)",
                (person, amount, paid)
            )

def update_debt(person, new_amount, new_paid):
    with get_connection() as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "UPDATE debts SET amount = %s, paid = %s WHERE person = %s",
                (new_amount, new_paid, person)
            )

            updated = cursor.rowcount


    return updated > 0

def delete_debt(person):
    with get_connection() as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "DELETE FROM debts WHERE person = %s",
                (person,)
            )

            deleted = cursor.rowcount

    return deleted > 0