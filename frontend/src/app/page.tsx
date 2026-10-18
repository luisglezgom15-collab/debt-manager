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

useEffect(() => {
  loadDebts();
}, [loadDebts]);

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
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {showForm ? "Cancelar" : "Agregar deuda"}
          </button>
        </header>
        {showForm && (
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
              const response = await fetch("http://127.0.0.1:8000/debts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newDebt),
              });

              if (!response.ok) {
                throw new Error("No se pudo guardar la deuda");
              }

              const createdDebt: Debt = await response.json();

              setDebts((currentDebts) => [createdDebt, ...currentDebts]);

              setPerson("");
              setAmount("");
              setPaid("");

              setFormMessage("¡Deuda guardada correctamente!");
            } catch (error) {
              console.error("Error al guardar la deuda:", error);
              setFormMessage("No se pudo guardar la deuda. Intenta nuevamente.");
            } finally {
              setSaving(false);
            }
          }} className="mt-6 rounded-xl bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">
            Registrar nueva deuda
          </h3>

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
            {saving ? "Guardando..." : "Guardar deuda"}
          </button>
        </form> 
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
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}