"use client";

import "../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { usePeriods, useExpenses } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import Modal from "@/components/budget/Modal";
import BudgetShell from "@/components/budget/BudgetShell";

interface Props { id: string; }

// Category color palette for donut
const CAT_COLORS = ["#111D35", "#0D9488", "#3B82F6", "#F59E0B", "#94A3B8", "#8B5CF6"];

const fmt = (n: number) =>
  n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Build a mini sparkline-like chart from expenses across the period
// (uses expense index as x-axis — illustrates cashflow waterfall)
function buildCashflowData(budget: number, expenses: { name: string; amount: number }[]) {
  let running = budget;
  return [
    { label: "Start", balance: budget },
    ...expenses.map((e) => {
      running -= e.amount;
      return { label: e.name, balance: Math.max(running, 0) };
    }),
  ];
}

export default function PeriodDetail({ id }: Props) {
  const router = useRouter();
  const { periods, updateBudget, deletePeriod } = usePeriods();
  const { expenses, addExpense, updateExpense, deleteExpense, total } = useExpenses(id);

  useSwipeToClose("/budget-tracker");

  const period = periods.find((p) => p.id === id);

  // Modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{ id: string } | null>(null);

  // Form fields
  const [budgetInput, setBudgetInput] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");

  const budget = period?.budget ?? 0;
  const remaining = budget - total;
  const spentPct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  const cashflowData = buildCashflowData(budget, expenses);

  // Donut data — top 5 + "Other"
  const donutData = (() => {
    if (expenses.length === 0) return [];
    const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
    if (sorted.length <= 6) return sorted.map((e) => ({ name: e.name, value: e.amount }));
    const top5 = sorted.slice(0, 5);
    const other = sorted.slice(5).reduce((s, e) => s + e.amount, 0);
    return [...top5.map((e) => ({ name: e.name, value: e.amount })), { name: "Other", value: other }];
  })();

  const handleSetBudget = () => {
    const val = parseFloat(budgetInput.replace(/,/g, ""));
    if (isNaN(val) || val < 0) return;
    updateBudget(id, val);
    setBudgetInput("");
    setShowBudgetModal(false);
  };

  const openBudgetModal = () => {
    setBudgetInput(budget ? String(budget) : "");
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
    setItemName(""); setItemAmount("");
    setShowItemModal(false);
  };

  const openEditExpense = (e: { id: string; name: string; amount: number }) => {
    setItemName(e.name);
    setItemAmount(String(e.amount));
    setEditingExpense({ id: e.id });
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setItemName(""); setItemAmount("");
    setEditingExpense(null);
  };

  if (!period && periods.length > 0) {
    router.replace("/budget-tracker");
    return null;
  }

  return (
    <BudgetShell>
      <div className="px-6 pt-8 pb-4 max-w-5xl mx-auto">

        {/* ── Page header ───────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => router.push("/budget-tracker")}
              className="text-xs font-medium mb-2 flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: "#64748B" }}
            >
              ← All Periods
            </button>
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "#0F172A" }}
            >
              {period?.label ?? "Loading…"}
            </h2>
          </div>
          <button
            onClick={() => {
              if (confirm(`Delete "${period?.label}"? This cannot be undone.`)) {
                deletePeriod(id);
                router.replace("/budget-tracker");
              }
            }}
            className="text-xs font-medium transition-colors hover:opacity-70 mt-1"
            style={{ color: "#94A3B8" }}
          >
            Delete period
          </button>
        </div>

        {/* ── Section 1: Metric cards ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Budget card */}
          <div className="bt-card p-5">
            <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: "#64748B" }}>
              Total Budget
            </p>
            <p className="bt-data text-3xl font-bold mb-1" style={{ color: "#0F172A", fontSize: "1.75rem" }}>
              {budget > 0 ? `₱${fmt(budget)}` : "—"}
            </p>
            <button
              onClick={openBudgetModal}
              className="text-xs font-medium transition-colors mt-1"
              style={{ color: "#0D9488" }}
            >
              {budget > 0 ? "Edit →" : "Set budget →"}
            </button>
          </div>

          {/* Spent card */}
          <div className="bt-card p-5">
            <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: "#64748B" }}>
              Total Spent
            </p>
            <p className="bt-data text-3xl font-bold mb-1" style={{ color: "#0F172A", fontSize: "1.75rem" }}>
              ₱{fmt(total)}
            </p>
            {budget > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
                  <span>{spentPct.toFixed(1)}% of budget</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${spentPct}%`,
                      background: spentPct > 90 ? "#FF5252" : "#0D9488",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Remaining card */}
          <div className="bt-card p-5">
            <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: "#64748B" }}>
              Remaining
            </p>
            <p
              className="bt-data text-3xl font-bold mb-1"
              style={{
                color: budget === 0 ? "#94A3B8" : remaining >= 0 ? "#00C97A" : "#FF5252",
                fontSize: "1.75rem",
              }}
            >
              {budget > 0 ? `₱${fmt(remaining)}` : "—"}
            </p>
            {budget > 0 && remaining < 0 && (
              <span className="bt-badge bt-badge-negative mt-1">Over budget</span>
            )}
            {budget > 0 && remaining >= 0 && remaining < budget * 0.1 && (
              <span className="bt-badge bt-badge-warning mt-1">Almost depleted</span>
            )}
          </div>
        </div>

        {/* ── Charts row (only when data exists) ───────────────── */}
        {expenses.length > 0 && budget > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Area chart — cashflow waterfall */}
            <div className="bt-card p-5">
              <p className="text-xs uppercase tracking-wider font-medium mb-4" style={{ color: "#64748B" }}>
                Balance Waterfall
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={cashflowData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0D9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    horizontal vertical={false}
                    stroke="#E2E8F0" strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                    width={48}
                  />
                  <Tooltip
                    formatter={(v: number) => [`₱${fmt(v)}`, "Balance"]}
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(11,19,37,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    fill="url(#tealGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#0D9488", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut — expense allocation */}
            <div className="bt-card p-5">
              <p className="text-xs uppercase tracking-wider font-medium mb-4" style={{ color: "#64748B" }}>
                Expense Allocation
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`₱${fmt(value)}`, name]}
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: "11px", color: "#64748B" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Section 2: Expense table ──────────────────────────── */}
        <div className="bt-card overflow-hidden mb-5">
          <div
            className="flex items-center justify-between px-5 py-3.5 border-b"
            style={{ background: "#EAEFF5", borderColor: "#E2E8F0" }}
          >
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "#64748B" }}>
              Expenses
            </p>
            <button
              onClick={() => setShowItemModal(true)}
              className="bt-btn-primary px-3 py-1.5 text-xs"
            >
              + Add Item
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: "#EAEFF5", color: "#CBD5E1" }}
              >
                ↕
              </div>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                No expenses recorded yet.
              </p>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div
                className="grid px-5 py-2.5"
                style={{
                  gridTemplateColumns: "1fr auto",
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: "#94A3B8" }}>
                  Item
                </span>
                <span className="text-xs uppercase tracking-wider font-medium text-right" style={{ color: "#94A3B8" }}>
                  Amount
                </span>
              </div>

              {/* Rows */}
              {expenses.map((e, idx) => (
                <button
                  key={e.id}
                  onClick={() => openEditExpense(e)}
                  className="bt-tr w-full grid px-5 py-3.5 text-sm"
                  style={{
                    gridTemplateColumns: "1fr auto",
                    borderBottom: idx < expenses.length - 1 ? "1px solid #F1F5F9" : "none",
                    textAlign: "left",
                  }}
                >
                  <span className="truncate pr-4 font-medium" style={{ color: "#0F172A" }}>
                    {e.name}
                  </span>
                  <span className="bt-data text-right tabular-nums" style={{ color: "#0F172A" }}>
                    ₱{fmt(e.amount)}
                  </span>
                </button>
              ))}

              {/* Total row */}
              <div
                className="grid px-5 py-3.5 text-sm font-semibold"
                style={{
                  gridTemplateColumns: "1fr auto",
                  background: "#F0FDF9",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "#0D9488" }}>
                  Total Spent
                </span>
                <span className="bt-data text-right tabular-nums" style={{ color: "#0D9488" }}>
                  ₱{fmt(total)}
                </span>
              </div>

              {/* Remaining row */}
              <div
                className="grid px-5 py-3.5 text-sm font-bold"
                style={{
                  gridTemplateColumns: "1fr auto",
                  background: "#FFFFFF",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "#64748B" }}>
                  Remaining
                </span>
                <span
                  className="bt-data text-right tabular-nums font-bold"
                  style={{ color: budget === 0 ? "#94A3B8" : remaining >= 0 ? "#00C97A" : "#FF5252" }}
                >
                  {budget > 0 ? `₱${fmt(remaining)}` : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FAB — add expense when rows exist */}
      {expenses.length > 0 && (
        <button
          onClick={() => setShowItemModal(true)}
          className="bt-btn-primary fixed bottom-8 right-6 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
          aria-label="Add expense"
        >
          +
        </button>
      )}

      {/* ── Budget modal ──────────────────────────────────────── */}
      {showBudgetModal && (
        <Modal
          title={budget ? "Edit Budget" : "Set Budget"}
          onClose={() => { setShowBudgetModal(false); setBudgetInput(""); }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="budget-input" className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
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
                className="bt-input bt-data"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowBudgetModal(false); setBudgetInput(""); }}
                className="bt-btn-ghost flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSetBudget}
                disabled={!budgetInput.trim()}
                className="bt-btn-primary flex-1 py-2.5"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Item modal ────────────────────────────────────────── */}
      {showItemModal && (
        <Modal
          title={editingExpense ? "Edit Expense" : "Add Expense"}
          onClose={closeItemModal}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="item-name" className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                Item
              </label>
              <input
                id="item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Groceries"
                autoFocus
                className="bt-input"
              />
            </div>
            <div>
              <label htmlFor="item-amount" className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
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
                className="bt-input bt-data"
              />
            </div>

            {editingExpense && (
              <button
                onClick={() => {
                  if (editingExpense) deleteExpense(editingExpense.id);
                  closeItemModal();
                }}
                className="w-full py-2 text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: "#FF5252" }}
              >
                Delete this item
              </button>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={closeItemModal} className="bt-btn-ghost flex-1 py-2.5">
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!itemName.trim() || !itemAmount.trim()}
                className="bt-btn-primary flex-1 py-2.5"
              >
                {editingExpense ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </BudgetShell>
  );
}
