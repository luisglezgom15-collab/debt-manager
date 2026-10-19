"use client";
import { useCallback, useEffect, useState } from "react";

type Debt = {
  id: number;
  person: string;
  amount: number;
  paid: number;
};

export default function Home() {

const [debts, setDebts] = useState<Debt[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [person, setPerson] = useState("");
const [amount, setAmount] = useState("");
const [paid, setPaid] = useState("");
const [formMessage, setFormMessage] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const [showForm, setShowForm] = useState(false);

const [editingDebtId, setEditingDebtId] = useState<number | null>(null);

const loadDebts = useCallback(() => {
  setLoading(true);
  setError(null);

  fetch("http://127.0.0.1:8000/debts")
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudieron obtener las deudas");
      }

      return response.json();
    })
    .then((data: Debt[]) => {
      setDebts(data);
    })
    .catch((error) => {
      console.error("Error al cargar las deudas:", error);
      setError("No pudimos cargar tus deudas. Intenta nuevamente.");
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

const [deletingDebtId, setDeletingDebtId] = useState<number | null>(null);
const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

const handleDeleteDebt = async (id: number) => {
  const confirmed = window.confirm(
    "¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer."
  );

  if (!confirmed) {
    return;
  }

  setDeletingDebtId(id);
  setDeleteMessage(null);

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/debts/${id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("No se pudo eliminar la deuda");
    }

    setDebts((currentDebts) =>
      currentDebts.filter((debt) => debt.id !== id)
    );
  } catch (error) {
    console.error("Error al eliminar la deuda:", error);
    setDeleteMessage(
      "No se pudo eliminar la deuda. Intenta nuevamente."
    );
  } finally {
    setDeletingDebtId(null);
  }
};

useEffect(() => {
  fetch("http://127.0.0.1:8000/debts")
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudieron obtener las deudas");
      }

      return response.json();
    })
    .then((data: Debt[]) => {
      setDebts(data);
    })
    .catch((error) => {
      console.error("Error al cargar las deudas:", error);
      setError("No pudimos cargar tus deudas. Intenta nuevamente.");
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

useEffect(() => {
  if (!showForm) {
    return;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && !saving) {
      setShowForm(false);
      setEditingDebtId(null);
      setPerson("");
      setAmount("");
      setPaid("");
      setFormMessage(null);
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [showForm, saving]);


const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const totalDebt = debts.reduce((total, debt) => {
  return total + debt.amount;
}, 0);

const totalPaid = debts.reduce((total, debt) => {
  return total + debt.paid;
}, 0);

const paidPercentage =
  totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <header className= "flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Debt Manager
        </h1>
      </header>

      <section className="mt-8">
        <h2>
          Mis deudas
        </h2>
        <p className="text-slate-500">
          Consulta y administra tus deudas en un solo lugar
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <article className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500">
            Deuda total
          </p>
          <p className="text-2xl font-bold">
            {currencyFormatter.format(totalDebt)}
          </p>
        </article>

        <article className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500">
            Total pagado
          </p>
          <p className="text-2xl font-bold">
            {currencyFormatter.format(totalPaid)}
          </p>
        </article>

          <article className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500">
            Saldo pendiente
          </p>
          <p className="text-2xl font-bold">
            {currencyFormatter.format(totalDebt - totalPaid)}
          </p>
        </article>

        <article className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500">
            Porcentaje pagado
          </p>
          <p className="text-2xl font-bold">
            {paidPercentage.toFixed(2)}%
          </p>
        </article>
      </section>

      <section className="mt-8">
        <header className= "flex items-center justify-between">
          <h2>
            Mis registros
          </h2>
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingDebtId(null);
                setPerson("");
                setAmount("");
                setPaid("");
                setFormMessage(null);
              } else {
                setEditingDebtId(null);
                setFormMessage(null);
                setShowForm(true);
              }
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Agregar deuda
          </button>
        </header>
        {deleteMessage && (
          <p className="mt-2 text-sm text-red-600">
            {deleteMessage}
          </p>
        )}
        <div className="mt-4 space-y-4">
          {loading ? (
            <p>Cargando deudas...</p>
          ) : error ? (
            <div>
              <p className="text-red-600">{error}</p>

              <button
                onClick={loadDebts}
                className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
) : (
            debts.map((debt) => {
              const debtPercentage =
                debt.amount > 0 ? (debt.paid / debt.amount) * 100 : 0;

              return (
                <article
                  key={debt.id}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <p className="text-sm text-slate-500">
                    {debt.person}
                  </p>

                  <p className="text-2xl font-bold">
                    {currencyFormatter.format(debt.amount)}
                  </p>

                  <p className="text-sm text-slate-500">
                    Pagado: {currencyFormatter.format(debt.paid)} (
                    {debtPercentage.toFixed(2)}%)
                  </p>

                  <div className="bg-slate-200 h-2 rounded-full overflow-hidden mt-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${debtPercentage}%` }}
                    />
                  </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDebtId(debt.id);
                      setPerson(debt.person);
                      setAmount(String(debt.amount));
                      setPaid(String(debt.paid));
                      setFormMessage(null);
                      setShowForm(true);
                    }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDebt(debt.id)}
                    disabled={deletingDebtId === debt.id}
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingDebtId === debt.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
                </article>
              );
            })
          )}
        </div>
      </section>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={async (event) => {
            event.preventDefault();
            if (saving) return;

            setSaving(true);
            setFormMessage(null);

            const newDebt = {
              person,
              amount: Number(amount),
              paid: Number(paid),
            };

            try {
              const url =
                editingDebtId !== null
                  ? `http://127.0.0.1:8000/debts/${editingDebtId}`
                  : "http://127.0.0.1:8000/debts";

              const response = await fetch(url, {
                method: editingDebtId !== null ? "PUT" : "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newDebt),
              });

              if (!response.ok) {
                throw new Error("No se pudo guardar la deuda");
              }

              const savedDebt: Debt = await response.json();

              if (editingDebtId !== null) {
                setDebts((currentDebts) =>
                  currentDebts.map((debt) =>
                    debt.id === savedDebt.id ? savedDebt : debt
                  )
                );

                setFormMessage("¡Deuda actualizada correctamente!");
              } else {
                setDebts((currentDebts) => [savedDebt, ...currentDebts]);

                setFormMessage("¡Deuda guardada correctamente!");
              }

              setPerson("");
              setAmount("");
              setPaid("");

              setShowForm(false);
              setEditingDebtId(null);
            } catch (error) {
              console.error("Error al guardar la deuda:", error);
              setFormMessage("No se pudo guardar la deuda. Intenta nuevamente.");
            } finally {
              setSaving(false);
            }
          }} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl space-y-4">

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {editingDebtId !== null
                ? "Editar deuda"
                : "Registrar nueva deuda"}
            </h3>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingDebtId(null);
                setPerson("");
                setAmount("");
                setPaid("");
                setFormMessage(null);
              }}
              className="rounded-md px-3 py-1 text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Cerrar formulario"
            >
              ×
            </button>
          </div>

          {formMessage && (
          <p className="text-sm">
            {formMessage}
          </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Persona o acreedor
            </label>
            <input
              type="text"
              required
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              className="w-full rounded-md border  border-slate-300 p-2"
              placeholder="Ej. Banco o persona"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Monto total
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-md border border-slate-300 p-2"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Monto pagado inicialmente
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={paid}
              onChange={(event) => setPaid(event.target.value)}
              className="w-full rounded-md border border-slate-300 p-2"
              placeholder="0"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? editingDebtId !== null
                ? "Guardando cambios..."
                : "Guardando..."
              : editingDebtId !== null
                ? "Guardar cambios"
                : "Guardar deuda"}
          </button>
        </form>
        </div>
      )}
    </main>
  );
}