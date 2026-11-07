"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Debt = {
  id: number;
  person: string;
  amount: number;
  paid: number;
};

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("theme-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-change", callback);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  return localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): "light" | "dark" {
  return "light";
}

function updateTheme(newTheme: "light" | "dark") {
  localStorage.setItem("theme", newTheme);
  window.dispatchEvent(new Event("theme-change"));
}

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

const [showCreateSettledWarning, setShowCreateSettledWarning] = useState(false);

const createSettledConfirmedRef = useRef(false);

const [editingDebtId, setEditingDebtId] = useState<number | null>(null);

const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
const formRef = useRef<HTMLFormElement>(null);
const duplicateConfirmedRef = useRef(false);

const loadDebts = useCallback(() => {
  setLoading(true);
  setError(null);

  fetch(`${API_URL}/debts`)
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

const [settledDebt, setSettledDebt] = useState<Debt | null>(null);
const [settlementMessage, setSettlementMessage] = useState<string | null>(null);
const [deletingSettledDebt, setDeletingSettledDebt] = useState(false);

const [showDeleteWarning, setShowDeleteWarning] = useState(false);
const [selectedDeleteDebtId, setSelectedDeleteDebtId] = useState<number | null>(null);


const handleDeleteDebt = (id: number) => {
  setSelectedDeleteDebtId(id);
  setShowDeleteWarning(true);
};

const confirmDeleteDebt = async () => {
  if (selectedDeleteDebtId === null) return;

  const id = selectedDeleteDebtId;

  setDeletingDebtId(id);
  setDeleteMessage(null);

  try {
    const response = await fetch(`${API_URL}/debts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("No se pudo eliminar la deuda");
    }

    setDebts((currentDebts) =>
      currentDebts.filter((debt) => debt.id !== id)
    );

    setShowDeleteWarning(false);
    setSelectedDeleteDebtId(null);
  } catch (error) {
    console.error("Error al eliminar la deuda:", error);
    setDeleteMessage(
      "No se pudo eliminar la deuda. Intenta nuevamente."
    );
  } finally {
    setDeletingDebtId(null);
  }
};

const deleteSettledDebt = async () => {
  if (!settledDebt) return;

  setDeletingSettledDebt(true);
  setSettlementMessage(null);

  try {
    const response = await fetch(
      `${API_URL}/debts/${settledDebt.id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("No se pudo eliminar la deuda");
    }

    setDebts((currentDebts) =>
      currentDebts.filter((debt) => debt.id !== settledDebt.id)
    );

    setSettledDebt(null);
  } catch (error) {
    console.error("Error al eliminar la deuda liquidada:", error);
    setSettlementMessage("No se pudo eliminar la deuda. Intenta nuevamente.");
  } finally {
    setDeletingSettledDebt(false);
  }
};

useEffect(() => {
  fetch(`${API_URL}/debts`)
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

const theme = useSyncExternalStore(
  subscribeToTheme,
  getThemeSnapshot,
  getServerThemeSnapshot
);

useEffect(() => {
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark"
  );
}, [theme]);

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
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Debt Manager
        </h1>

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => updateTheme("light")}
            aria-label="Activar modo claro"
            aria-pressed={theme === "light"}
            className={`flex items-center justify-center rounded-md p-2 transition-colors ${
              theme === "light"
                ? "bg-white text-amber-600 shadow-sm dark:bg-slate-700 dark:text-amber-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.42 1.42" />
              <path d="m17.65 17.65 1.42 1.42" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.35 17.65-1.42 1.42" />
              <path d="m19.07 4.93-1.42 1.42" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => updateTheme("dark")}
            aria-label="Activar modo oscuro"
            aria-pressed={theme === "dark"}
            className={`flex items-center justify-center rounded-md p-2 transition-colors ${
              theme === "dark"
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.463.402.807a6.5 6.5 0 0 0 8.268 8.268c.344-.215.829-.003.803.397Z" />
            </svg>
          </button>
        </div>

      </header>

      <section className="mt-8">
        <h2>
          Mis deudas
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Consulta y administra tus deudas en un solo lugar
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <article className="rounded-xl bg-white p-6 shadow-sm transition-colors dark:bg-slate-900 dark:shadow-black/20">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Deuda total
          </p>
          <p className="text-2xl font-bold">
            {currencyFormatter.format(totalDebt)}
          </p>
        </article>

        <article className="bg-white p-6 rounded-xl shadow-sm transition-colors dark:bg-slate-900 dark:shadow-black/20">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total pagado
          </p>
          <p className="text-2xl font-bold">
            {currencyFormatter.format(totalPaid)}
          </p>
        </article>

          <article className="bg-white p-6 rounded-xl shadow-sm transition-colors dark:bg-slate-900 dark:shadow-black/20">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Saldo pendiente
          </p>
          <p className="text-2xl font-bold">
            {currencyFormatter.format(totalDebt - totalPaid)}
          </p>
        </article>

        <article className="bg-white p-6 rounded-xl shadow-sm transition-colors dark:bg-slate-900 dark:shadow-black/20">
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
                
              const remaining = debt.amount - debt.paid;
              const isSettled = remaining === 0;

              return (
                <article
                  key={debt.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Deuda #{debt.id}
                      </p>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {debt.person}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isSettled
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {isSettled ? "Liquidada" : "En curso"}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Saldo pendiente
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {currencyFormatter.format(remaining)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      deuda inicial de {currencyFormatter.format(debt.amount)} 
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Monto pagado
                      </p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                        {currencyFormatter.format(debt.paid)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Avance
                      </p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                        {debtPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Progreso de pago
                      </p>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {debtPercentage.toFixed(2)}%
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${debtPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
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
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDebt(debt.id)}
                      disabled={deletingDebtId === debt.id}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
          <form ref={formRef} noValidate onSubmit={async (event) => {
            event.preventDefault();
            if (
              !person.trim() ||
              amount.trim() === "" ||
              paid.trim() === ""
            ) {
              setFormMessage("Completa todos los campos.");
              return;
            }

            const amountValue = Number(amount);
            const paidValue = Number(paid);

            if (
              !Number.isFinite(amountValue) ||
              !Number.isFinite(paidValue) ||
              amountValue <= 0 ||
              paidValue < 0 ||
              paidValue > amountValue
            ) {
              setFormMessage("Verifica los montos ingresados.");
              return;
            }

            if (saving) return;

            const normalizedPerson = person.trim().toLowerCase();

            const duplicateExists = debts.some(
              (debt) =>
                debt.person.trim().toLowerCase() === normalizedPerson &&
                debt.id !== editingDebtId
            );

            if (duplicateExists && !duplicateConfirmedRef.current) {
              setShowDuplicateWarning(true);
              return;
            }

            duplicateConfirmedRef.current = false;

            if (
              editingDebtId === null &&
              paidValue === amountValue &&
              !createSettledConfirmedRef.current
            ) {
              setShowCreateSettledWarning(true);
              return;
            }

            createSettledConfirmedRef.current = false;

            setSaving(true);
            setFormMessage(null);

            const newDebt = {
              person: person.trim(),
              amount: amountValue,
              paid: paidValue,
            };

            try {
              const url =
                editingDebtId !== null
                  ? `${API_URL}/debts/${editingDebtId}`
                  : `${API_URL}/debts`;

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

                const previousDebt =
                  editingDebtId !== null
                    ? debts.find((debt) => debt.id === editingDebtId)
                    : undefined;

                const wasJustSettled =
                  previousDebt !== undefined &&
                  previousDebt.paid < previousDebt.amount &&
                  savedDebt.paid === savedDebt.amount;

                setFormMessage("¡Deuda actualizada correctamente!");
                if (wasJustSettled) {
                  setSettledDebt(savedDebt);
                  setSettlementMessage(null);
                }

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
          }} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100 space-y-4">

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
              className="rounded-md px-3 py-1 text-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
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
              className="w-full rounded-md border  border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 p-2"
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
              min="0"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 p-2"
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
              step="100"
              value={paid}
              onChange={(event) => setPaid(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 p-2"
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
      {showDuplicateWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="duplicate-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl dark:bg-amber-900/40">
              !
            </div>

            <h3
              id="duplicate-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Nombre ya registrado
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Ya existe una deuda registrada a nombre de{" "}
              <strong className="text-slate-900 dark:text-white">
                {person.trim()}
              </strong>.
              ¿Deseas registrar otra deuda con el mismo nombre?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateWarning(false);
                  duplicateConfirmedRef.current = false;
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  duplicateConfirmedRef.current = true;
                  setShowDuplicateWarning(false);
                  formRef.current?.requestSubmit();
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Continuar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600 dark:bg-red-900/40 dark:text-red-400">
              !
            </div>

            <h3
              id="delete-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              ¿Eliminar esta deuda?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Estás a punto de eliminar la deuda de{" "}
              <strong className="text-slate-900 dark:text-white">
                {debts.find((debt) => debt.id === selectedDeleteDebtId)?.person}
              </strong>.
              Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deletingDebtId !== null}
                onClick={() => {
                  setShowDeleteWarning(false);
                  setSelectedDeleteDebtId(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDeleteDebt}
                disabled={deletingDebtId !== null}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingDebtId !== null ? "Eliminando..." : "Eliminar deuda"}
              </button>
            </div>
          </div>
        </div>
      )}
      {settledDebt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="settled-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600 dark:bg-green-900/40 dark:text-green-400">
              ✓
            </div>

            <h3
              id="settled-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              ¡Deuda liquidada!
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              La deuda de{" "}
              <strong className="text-slate-900 dark:text-white">
                {settledDebt.person}
              </strong>{" "}
              ha sido pagada completamente.
            </p>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              ¿Qué deseas hacer con este registro?
            </p>

            {settlementMessage && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {settlementMessage}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deletingSettledDebt}
                onClick={deleteSettledDebt}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingSettledDebt ? "Eliminando..." : "Eliminar deuda"}
              </button>

              <button
                type="button"
                disabled={deletingSettledDebt}
                onClick={() => setSettledDebt(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Conservar deuda
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateSettledWarning && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="create-settled-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600 dark:bg-green-900/40 dark:text-green-400">
              ✓
            </div>

            <h3
              id="create-settled-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              ¡Esta deuda ya está liquidada!
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              La deuda de{" "}
              <strong className="text-slate-900 dark:text-white">
                {person.trim()}
              </strong>{" "}
              no tiene saldo pendiente. ¿Deseas registrarla de todas formas?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCreateSettledWarning(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  createSettledConfirmedRef.current = true;
                  setShowCreateSettledWarning(false);
                  formRef.current?.requestSubmit();
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Registrar deuda
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}