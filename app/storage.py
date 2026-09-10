import json

def load_debts_from_json():
    try:
        with open("debts.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_debts_to_json(debts):
    with open("debts.json", "w") as f:
        json.dump(debts, f)