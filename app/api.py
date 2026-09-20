from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator
from .database import get_debts, get_debt_for_id, add_debt, delete_debt, update_debt

app = FastAPI()

class DebtCreate(BaseModel):
    person: str
    amount: int = Field(gt=0)
    paid: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_debt(self):
        if self.paid > self.amount:
            raise ValueError("El monto pagado no puede ser mayor que la deuda")

        return self


class DebtUpdate(BaseModel):
    amount: int = Field(gt=0)
    paid: int = Field(ge=0)
    

@app.get("/hello")
def say_hello():
    return {
        "message": "Hello Debt Manager"
    }

@app.get("/debts")
def api_get_debts():
    return get_debts()

@app.get("/debts/{id}")
def api_get_debts_for_id(id):

    debt = get_debt_for_id(id)

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="No se encontro ninguna deuda con ese ID"
        )
    
    return debt

@app.post("/debts", status_code=201)
def api_add_debt(debt: DebtCreate):
    return add_debt(debt.person, debt.amount, debt.paid)

@app.delete("/debts/{id}")
def api_delete_debts(id):

    deleted = delete_debt(id)

    if deleted is False:
        raise HTTPException(
            status_code=404,
            detail="No se encontro ninguna deuda con ese ID"
        )

    return deleted

@app.put("/debts/{id}")
def api_update_debt(id, debt: DebtUpdate):

    updated = update_debt(id, debt.amount, debt.paid)

    if updated is False:
        raise HTTPException(
            status_code=404,
            detail="No se encontro ninguna deuda con ese ID"
        )

    return updated