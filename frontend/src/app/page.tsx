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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Agregar deuda
          </button>
        </header>
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