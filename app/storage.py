import json

def load_debts_from_json(filename="debts.json"):
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_debts_to_json(debts, filename="debts.json"):
    with open(filename, "w") as f:
        json.dump(debts, f)