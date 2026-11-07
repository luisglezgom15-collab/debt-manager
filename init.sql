CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    person VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid NUMERIC(12, 2) NOT NULL,

    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT paid_non_negative CHECK (paid >= 0),
    CONSTRAINT paid_not_greater_than_amount CHECK (paid <= amount),
    CONSTRAINT person_not_empty CHECK (LENGTH(TRIM(person)) > 0)
);