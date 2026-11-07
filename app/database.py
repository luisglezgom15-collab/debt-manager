import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

if not DATABASE_URL:
    required_variables = {
        "DB_HOST": DB_HOST,
        "DB_USER": DB_USER,
        "DB_NAME": DB_NAME
    }

    missing_variables = [
        variable
        for variable, value in required_variables.items()
        if not value
    ]

    if missing_variables:
        raise ValueError(
            f"Faltan variables de entorno obligatorias: {', '.join(missing_variables)}"
        )


def get_connection(database=DB_NAME):
    if DATABASE_URL and (database is None or database == DB_NAME):
        return psycopg.connect(DATABASE_URL)

    return psycopg.connect(
        dbname=database,
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )

def get_debts(database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "SELECT id, person, amount, paid FROM debts"
            )

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

def add_debt(person, amount, paid, database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "INSERT INTO debts (person, amount, paid) VALUES (%s, %s, %s)  RETURNING id, person, amount, paid",
                (person, amount, paid),
            )

            row = cursor.fetchone()

            id, person, amount, paid = row

            return {
                "id": id,
                "person": person,
                "amount": amount,
                "paid": paid
            }


def update_debt(id, new_amount, new_paid, database=DB_NAME, new_person=None):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:
            if new_person is None:
                cursor.execute(
                    """UPDATE debts
                    SET amount = %s, paid = %s
                    WHERE id = %s
                    RETURNING id, person, amount, paid""",
                    (new_amount, new_paid, id)
                )
            else:
                cursor.execute(
                    """UPDATE debts
                    SET person = %s, amount = %s, paid = %s
                    WHERE id = %s
                    RETURNING id, person, amount, paid""",
                    (new_person, new_amount, new_paid, id)
                )

            updated = cursor.fetchone()

            if updated is None:
                return None

            return {
                "id": updated[0],
                "person": updated[1],
                "amount": updated[2],
                "paid": updated[3],
            }


def delete_debt(id, database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "DELETE FROM debts WHERE id = %s",
                (id,)
            )

            deleted = cursor.rowcount

    return deleted > 0

def get_debt_for_id(id, database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, person, amount, paid FROM debts WHERE id = %s",
                (id,)
            )

            row = cursor.fetchone()


            if row is None:
             return None

            id, person, amount, paid = row

            return ({
                "id": id,
                "person": person,
                "amount": amount,
                "paid": paid
            })
