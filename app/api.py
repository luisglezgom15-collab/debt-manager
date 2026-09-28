from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, model_validator
from .database import get_debts, get_debt_for_id, add_debt, delete_debt, update_debt, DB_NAME

app = FastAPI(
    title="Debt Manager API",
    description="API para la gestión de deudas personales",
    version="1.0.0"
    )

class Debt(BaseModel):
    id: int
    person: str
    amount: int
    paid: int

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

def get_db():
    return DB_NAME

@app.get("/hello")
def say_hello():
    return {
        "message": "Hello Debt Manager"
    }

@app.get("/debts", response_model=list[Debt], summary="Obtener todas las deudas", description="Devuelve todas las deudas registradas en el sistema.")
def api_get_debts(database: str = Depends(get_db)):
    return get_debts(database)

@app.get("/debts/{id}", response_model=Debt, summary="Obtener una deuda por ID", description="Devuelve la deuda correspondiente al ID proporcionado.")
def api_get_debt_for_id(id: int, database: str = Depends(get_db)):

    debt = get_debt_for_id(id, database)

    if debt is None:
        raise HTTPException(
            status_code=404,
            detail="No se encontro ninguna deuda con ese ID"
        )
    
    return debt

@app.post("/debts", status_code=201, response_model=Debt, summary="Crear deuda", description="Crea una deuda con los datos de person, amount y paid.")
def api_add_debt(debt: DebtCreate, database: str = Depends(get_db)):
    return add_debt(debt.person, debt.amount, debt.paid, database=database)

@app.delete("/debts/{id}", status_code=204, summary="Eliminar deuda", description="Elimina la deuda correspondiente al ID proporcionado.")
def api_delete_debt(id: int, database: str = Depends(get_db)):

    deleted = delete_debt(id, database=database)

    if deleted is False:
        raise HTTPException(
            status_code=404,
            detail="No se encontro ninguna deuda con ese ID"
        )


@app.put("/debts/{id}", response_model=Debt, summary="Actualizar deuda", description="Actualiza los valores de amount y paid de la deuda con el ID seleccionado.")
def api_update_debt(id:int, debt: DebtUpdate, database: str = Depends(get_db), ):

    updated = update_debt(id, debt.amount, debt.paid, database=database)

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="No se encontro ninguna deuda con ese ID"
        )

    return updated