import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def get_connection(database=DB_NAME):
    return psycopg.connect(
        f"dbname={database} host={DB_HOST} user={DB_USER} password={DB_PASSWORD}"
    )

def get_debts(database=DB_NAME):
    with get_connection(database) as connection:
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

def add_debt(person, amount, paid, database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "INSERT INTO debts (person, amount, paid) VALUES (%s, %s, %s)",
                (person, amount, paid)
            )

def update_debt(id, new_amount, new_paid, database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "UPDATE debts SET amount = %s, paid = %s WHERE id = %s",
                (new_amount, new_paid, id)
            )

            updated = cursor.rowcount


    return updated > 0

def delete_debt(id, database=DB_NAME):
    with get_connection(database) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                "DELETE FROM debts WHERE id = %s",
                (id,)
            )

            deleted = cursor.rowcount

    return deleted > 0