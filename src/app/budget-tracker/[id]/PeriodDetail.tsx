"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { usePeriods, useExpenses } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import Modal from "@/components/budget/Modal";

interface Props {
  id: string;
}

export default function PeriodDetail({ id }: Props) {
  const router = useRouter();
  const { periods, updateBudget, deletePeriod } = usePeriods();
  const { expenses, addExpense, updateExpense, deleteExpense, total } = useExpenses(id);

  // Swipe left/right → back to list
  useSwipeToClose("/budget-tracker");

  const period = periods.find((p) => p.id === id);

  // Modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{ id: string; name: string; amount: string } | null>(null);

  // Budget form
  const [budgetInput, setBudgetInput] = useState("");

  // Expense form
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");

  const remaining = (period?.budget ?? 0) - total;

  const handleSetBudget = () => {
    const val = parseFloat(budgetInput.replace(/,/g, ""));
    if (isNaN(val) || val < 0) return;
    updateBudget(id, val);
    setBudgetInput("");
    setShowBudgetModal(false);
  };

  const openBudgetModal = () => {
    setBudgetInput(period?.budget ? String(period.budget) : "");
    setShowBudgetModal(true);
  };

  const handleAddItem = () => {
    const name = itemName.trim();
    const amount = parseFloat(itemAmount.replace(/,/g, ""));
    if (!name || isNaN(amount) || amount < 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, name, amount);
      setEditingExpense(null);
    } else {
      addExpense(name, amount);
    }

    setItemName("");
    setItemAmount("");
    setShowItemModal(false);
  };

  const openEditExpense = (e: { id: string; name: string; amount: number }) => {
    setItemName(e.name);
    setItemAmount(String(e.amount));
    setEditingExpense({ id: e.id, name: e.name, amount: String(e.amount) });
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setItemName("");
    setItemAmount("");
    setEditingExpense(null);
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!period && periods.length > 0) {
    // Period not found — back to list
    router.replace("/budget-tracker");
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <button
          onClick={() => router.push("/budget-tracker")}
          className="font-mono text-xs transition-colors hover:text-[var(--accent-bright)]"
          style={{ color: "var(--fg-muted)" }}
          aria-label="Back"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${period?.label}"? This cannot be undone.`)) {
              deletePeriod(id);
              router.replace("/budget-tracker");
            }
          }}
          className="font-mono text-xs transition-colors hover:text-[var(--terracotta)]"
          style={{ color: "var(--fg-muted)" }}
        >
          Delete
        </button>
      </header>

      <div className="px-5 space-y-8 mt-2">

        {/* ── Section 1: Total Budget ──────────────────────────────── */}
        <section>
          <p
            className="font-mono text-[0.65rem] uppercase tracking-widest mb-1"
            style={{ color: "var(--accent-bright)" }}
          >
            Total Salary / Budget
          </p>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {period?.label ?? "—"}
          </h2>

          <div className="flex items-end gap-4 mt-3">
            {period?.budget ? (
              <p className="text-3xl font-bold font-mono">
                ₱{fmt(period.budget)}
              </p>
            ) : (
              <p
                className="text-base font-mono"
                style={{ color: "var(--fg-muted)" }}
              >
                No budget set yet.
              </p>
            )}
            <button
              onClick={openBudgetModal}
              className="mb-0.5 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-colors"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              {period?.budget ? "Edit" : "+ Set Budget"}
            </button>
          </div>
        </section>

        {/* ── Section 2: Expense Table ─────────────────────────────── */}
        <section>
          <p
            className="font-mono text-[0.65rem] uppercase tracking-widest mb-3"
            style={{ color: "var(--accent-bright)" }}
          >
            Expenses
          </p>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <p
                className="font-mono text-sm text-center"
                style={{ color: "var(--fg-muted)" }}
              >
                No expenses yet.
              </p>
              <button
                onClick={() => setShowItemModal(true)}
                className="px-8 py-3 rounded-xl font-mono text-sm font-bold transition-colors"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                + Add Item
              </button>
            </div>
          ) : (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--card-border)" }}
            >
              {/* Column headers */}
              <div
                className="grid grid-cols-2 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-wider"
                style={{
                  color: "var(--fg-muted)",
                  background: "var(--card-bg)",
                  borderBottom: "1px solid var(--card-border)",
                }}
              >
                <span>Item</span>
                <span className="text-right">Amount</span>
              </div>

              {/* Expense rows */}
              {expenses.map((e) => (
                <button
                  key={e.id}
                  onClick={() => openEditExpense(e)}
                  className="w-full grid grid-cols-2 px-4 py-3.5 text-sm transition-colors text-left group"
                  style={{
                    background: "var(--card-bg)",
                    borderBottom: "1px solid var(--card-border)",
                  }}
                >
                  <span className="truncate pr-2 group-hover:text-[var(--accent-bright)] transition-colors">
                    {e.name}
                  </span>
                  <span className="text-right font-mono tabular-nums">
                    ₱{fmt(e.amount)}
                  </span>
                </button>
              ))}

              {/* Total row */}
              <div
                className="grid grid-cols-2 px-4 py-3.5 text-sm font-bold"
                style={{
                  background: "color-mix(in srgb, var(--accent) 6%, var(--card-bg))",
                  borderBottom: "1px solid var(--card-border)",
                }}
              >
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
                  Total
                </span>
                <span className="text-right font-mono tabular-nums">
                  ₱{fmt(total)}
                </span>
              </div>

              {/* Remaining row */}
              <div
                className="grid grid-cols-2 px-4 py-3.5 text-sm font-bold"
                style={{
                  background: "var(--card-bg)",
                }}
              >
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
                  Remaining
                </span>
                <span
                  className="text-right font-mono tabular-nums"
                  style={{ color: remaining >= 0 ? "var(--accent-bright)" : "var(--terracotta)" }}
                >
                  ₱{fmt(remaining)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 3: Summary (shown only when table is populated) ─ */}
        {expenses.length > 0 && (
          <section
            className="rounded-xl border p-5"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <p
              className="font-mono text-[0.65rem] uppercase tracking-widest mb-4"
              style={{ color: "var(--accent-bright)" }}
            >
              Summary
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--fg-muted)" }}>Budget</span>
                <span className="font-mono tabular-nums">
                  {period?.budget ? `₱${fmt(period.budget)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--fg-muted)" }}>Spent</span>
                <span className="font-mono tabular-nums text-[var(--terracotta)]">
                  ₱{fmt(total)}
                </span>
              </div>
              <div
                className="flex justify-between text-sm font-bold pt-2 mt-2"
                style={{ borderTop: "1px solid var(--card-border)" }}
              >
                <span>Remaining</span>
                <span
                  className="font-mono tabular-nums"
                  style={{ color: remaining >= 0 ? "var(--accent-bright)" : "var(--terracotta)" }}
                >
                  ₱{fmt(remaining)}
                </span>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* FAB — add expense (only when items exist) */}
      {expenses.length > 0 && (
        <button
          onClick={() => setShowItemModal(true)}
          className="fixed bottom-8 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-transform active:scale-95"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
          aria-label="Add expense"
        >
          +
        </button>
      )}

      {/* ── Budget Modal ───────────────────────────────────────────── */}
      {showBudgetModal && (
        <Modal
          title={period?.budget ? "Edit Budget" : "Set Budget"}
          onClose={() => { setShowBudgetModal(false); setBudgetInput(""); }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="budget-input"
                className="block font-mono text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--fg-muted)" }}
              >
                Amount (₱)
              </label>
              <input
                id="budget-input"
                type="number"
                inputMode="decimal"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSetBudget(); }}
                placeholder="0.00"
                autoFocus
                className="w-full rounded-lg border px-4 py-3 text-sm bg-transparent outline-none focus:border-[var(--accent)] font-mono"
                style={{ borderColor: "var(--card-border)", color: "var(--fg)" }}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowBudgetModal(false); setBudgetInput(""); }}
                className="flex-1 py-3 rounded-lg border font-mono text-sm transition-colors"
                style={{ borderColor: "var(--card-border)", color: "var(--fg-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSetBudget}
                disabled={!budgetInput.trim()}
                className="flex-1 py-3 rounded-lg font-mono text-sm font-bold transition-colors disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Item Modal ─────────────────────────────────────────────── */}
      {showItemModal && (
        <Modal
          title={editingExpense ? "Edit Expense" : "Add Expense"}
          onClose={closeItemModal}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="item-name"
                className="block font-mono text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--fg-muted)" }}
              >
                Item
              </label>
              <input
                id="item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Groceries"
                autoFocus
                className="w-full rounded-lg border px-4 py-3 text-sm bg-transparent outline-none focus:border-[var(--accent)]"
                style={{ borderColor: "var(--card-border)", color: "var(--fg)" }}
              />
            </div>
            <div>
              <label
                htmlFor="item-amount"
                className="block font-mono text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--fg-muted)" }}
              >
                Amount (₱)
              </label>
              <input
                id="item-amount"
                type="number"
                inputMode="decimal"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); }}
                placeholder="0.00"
                className="w-full rounded-lg border px-4 py-3 text-sm bg-transparent outline-none focus:border-[var(--accent)] font-mono"
                style={{ borderColor: "var(--card-border)", color: "var(--fg)" }}
              />
            </div>

            {/* Delete option when editing */}
            {editingExpense && (
              <button
                onClick={() => {
                  deleteExpense(editingExpense.id);
                  closeItemModal();
                }}
                className="w-full py-2 font-mono text-xs transition-colors hover:text-[var(--terracotta)]"
                style={{ color: "var(--fg-muted)" }}
              >
                Delete this item
              </button>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeItemModal}
                className="flex-1 py-3 rounded-lg border font-mono text-sm transition-colors"
                style={{ borderColor: "var(--card-border)", color: "var(--fg-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!itemName.trim() || !itemAmount.trim()}
                className="flex-1 py-3 rounded-lg font-mono text-sm font-bold transition-colors disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                {editingExpense ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
