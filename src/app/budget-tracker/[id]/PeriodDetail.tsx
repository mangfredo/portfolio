"use client";

import "../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { usePeriods, useExpenses } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import { useCountUp } from "@/hooks/useCountUp";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import Modal from "@/components/budget/Modal";
import BudgetShell from "@/components/budget/BudgetShell";

interface Props { id: string; }

// 12-color vivid palette — no dark navy or flat grey
const CAT_COLORS = [
  "#0D9488", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#10B981", "#F97316", "#EC4899", "#06B6D4", "#84CC16",
  "#A855F7", "#14B8A6",
];

const fmt = (n: number) =>
  n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

// ── Custom glassmorphism tooltip ───────────────────────────────────────────
function GlassTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm shadow-2xl"
      style={{
        background: "rgba(15,23,42,0.82)",
        backdropFilter: "blur(8px)",
        border: "1px solid #334155",
        fontFamily: "var(--bt-font-ui)",
        minWidth: "160px",
      }}
    >
      <p className="text-xs font-medium mb-2 truncate" style={{ color: "#94A3B8" }}>
        {label}
      </p>
      {payload.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 font-semibold" style={{ color: "#E2E8F0" }}>
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="flex-1 text-xs">{item.name}:</span>
          <span
            className="bt-data text-xs"
            style={{ fontFamily: "var(--bt-font-data)" }}
          >
            ₱{fmt(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Animated metric value ──────────────────────────────────────────────────
function MetricValue({ value, prefix = "₱", fallback = "—" }: {
  value: number;
  prefix?: string;
  fallback?: string;
}) {
  const animated = useCountUp({ target: value, duration: 700, enabled: value > 0 });
  if (value === 0) return <>{fallback}</>;
  return <>{prefix}{fmt(Math.round(animated))}</>;
}

export default function PeriodDetail({ id }: Props) {
  const router = useRouter();
  const { theme } = useBudgetSettingsCtx();
  const isDark = theme === "dark";

  const { periods, updateBudget, deletePeriod } = usePeriods();
  const { expenses, addExpense, updateExpense, deleteExpense, togglePaid, total } = useExpenses(id);

  useSwipeToClose("/budget-tracker");

  const period = periods.find((p) => p.id === id);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{ id: string } | null>(null);

  const [budgetInput, setBudgetInput] = useState("");
  const [itemName, setItemName]     = useState("");
  const [itemAmount, setItemAmount] = useState("");

  const budget    = period?.budget ?? 0;
  const remaining = budget - total;
  const spentPct  = budget > 0 ? (total / budget) * 100 : 0;

  const cashflowData = buildCashflowData(budget, expenses);

  const donutData = expenses.length === 0
    ? []
    : expenses.map((e) => ({ name: e.name, value: e.amount }));

  // Dynamic colors based on theme
  const textMain  = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#415A77";
  const cardBg    = isDark ? "#111D35" : "#FFFFFF";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "#CBD5E1";
  const altBg     = isDark ? "#1E2D4A" : "#F1F5F9";
  const teal      = isDark ? "#2DD4BF" : "#0D9488";

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
    const name   = itemName.trim();
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

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => router.push("/budget-tracker")}
              className="bt-text-muted text-xs font-medium mb-2 flex items-center gap-1 transition-opacity hover:opacity-70"
            >
              ← All Periods
            </button>
            <h2
              className="bt-text-main text-2xl font-semibold tracking-tight"
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
            className="bt-text-muted text-xs font-medium transition-opacity hover:opacity-70 mt-1"
          >
            Delete period
          </button>
        </div>

        {/* ── Metric cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Budget */}
          <div
            className="bt-card bt-metric-glow metric-card-glow-teal p-5"
            style={{ background: cardBg, border: `1px solid ${borderCol}`, boxShadow: isDark ? "0 4px 20px -2px rgba(0,0,0,0.5)" : "0 1px 3px 0 rgba(11,19,37,0.05)" }}
          >
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-3">
              Total Budget
            </p>
            <p className="bt-text-main bt-data font-bold mb-1" style={{ fontSize: "1.75rem" }}>
              {budget > 0 ? <MetricValue value={budget} /> : "—"}
            </p>
            <button
              onClick={openBudgetModal}
              className="bt-text-teal text-xs font-medium transition-opacity hover:opacity-70 mt-1"
            >
              {budget > 0 ? "Edit →" : "Set budget →"}
            </button>
          </div>

          {/* Spent */}
          <div
            className="bt-card metric-card-glow-teal p-5"
            style={{ background: cardBg, border: `1px solid ${borderCol}`, boxShadow: isDark ? "0 4px 20px -2px rgba(0,0,0,0.5)" : "0 1px 3px 0 rgba(11,19,37,0.05)" }}
          >
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-3">
              Total Spent
            </p>
            <p className="bt-text-main bt-data font-bold mb-1" style={{ fontSize: "1.75rem" }}>
              <MetricValue value={total} />
            </p>
            {budget > 0 && (
              <div className="mt-2">
                <div className="bt-text-muted flex justify-between text-xs mb-1">
                  <span>{spentPct.toFixed(1)}% of budget</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "#334155" : "#E2E8F0" }}>
                  <div
                    className="progress-bar-fill h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(spentPct, 100)}%`, background: spentPct > 90 ? "#FF5252" : undefined }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Remaining */}
          <div
            className="bt-card bt-metric-glow metric-card-glow-positive p-5"
            style={{ background: cardBg, border: `1px solid ${borderCol}`, boxShadow: isDark ? "0 4px 20px -2px rgba(0,0,0,0.5)" : "0 1px 3px 0 rgba(11,19,37,0.05)" }}
          >
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-3">
              Remaining
            </p>
            <p
              className="bt-data font-bold mb-1"
              style={{
                color: budget === 0 ? textMuted : remaining >= 0 ? (isDark ? "#00E699" : "#00C97A") : "#FF5252",
                fontSize: "1.75rem",
              }}
            >
              {budget > 0 ? <MetricValue value={Math.abs(remaining)} prefix={remaining < 0 ? "-₱" : "₱"} /> : "—"}
            </p>
            {budget > 0 && remaining < 0 && (
              <span className="bt-badge bt-badge-negative mt-1">Over budget</span>
            )}
            {budget > 0 && remaining >= 0 && remaining < budget * 0.1 && (
              <span className="bt-badge bt-badge-warning mt-1">Almost depleted</span>
            )}
          </div>
        </div>

        {/* ── Charts ──────────────────────────────────────────────── */}
        {expenses.length > 0 && budget > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Area chart */}
            <div
              className="bt-card p-5"
              style={{ background: cardBg, border: `1px solid ${borderCol}` }}
            >
              <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-4">
                Balance Waterfall
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={cashflowData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="btCashflowLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#0D9488" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#415A77" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="btCashflowLightRevamp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#0D9488" stopOpacity={0.35} />
                      <stop offset="50%" stopColor="#415A77" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="btVibrantLightArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#0D9488" stopOpacity={0.60} />
                      <stop offset="40%" stopColor="#415A77" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="btVibrantLightStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"  stopColor="#0D9488" />
                      <stop offset="50%" stopColor="#415A77" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="btCashflowDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#00B4D8" stopOpacity={0.55} />
                      <stop offset="60%" stopColor="#415A77" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#0D1B2A" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="btExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#EF4444" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0D1B2A" stopOpacity={0.00} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    horizontal vertical={false}
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0"}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: textMuted }}
                    axisLine={false} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: textMuted }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                    width={48}
                  />
                  <Tooltip content={<GlassTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke={teal}
                    strokeWidth={2}
                    fill={isDark ? "url(#btCashflowDark)" : "url(#btVibrantLightArea)"}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: teal,
                      stroke: isDark ? "#1E293B" : "#FFFFFF",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart */}
            <div
              className="bt-card p-5"
              style={{ background: cardBg, border: `1px solid ${borderCol}` }}
            >
              <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-4">
                Expense Allocation
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: "11px", color: textMuted, lineHeight: "1.6" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Expense table ────────────────────────────────────────── */}
        <div
          className="bt-card overflow-hidden mb-5"
          style={{ background: cardBg, border: `1px solid ${borderCol}` }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5 border-b"
            style={{ background: altBg, borderColor: borderCol }}
          >
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium">
              Expenses
            </p>
            <button onClick={() => setShowItemModal(true)} className="bt-btn-primary px-3 py-1.5 text-xs">
              + Add Item
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: altBg, color: borderCol }}
              >
                ↕
              </div>
              <p className="bt-text-muted text-sm">No expenses recorded yet.</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div
                className="grid px-5 py-2.5"
                style={{ gridTemplateColumns: "1fr auto", background: isDark ? "#1E2D4A" : "#F8FAFC", borderBottom: `1px solid ${borderCol}` }}
              >
                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: "#94A3B8" }}>Item</span>
                <span className="text-xs uppercase tracking-wider font-medium text-right" style={{ color: "#94A3B8" }}>Amount</span>
              </div>

              {/* Rows */}
              {expenses.map((e, idx) => (
                <button
                  key={e.id}
                  onClick={() => openEditExpense(e)}
                  className="bt-tr w-full grid px-5 py-3.5 text-sm"
                  style={{
                    gridTemplateColumns: "1fr auto",
                    borderBottom: idx < expenses.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9"}` : "none",
                    textAlign: "left",
                    background: isDark
                      ? idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.05)"
                      : undefined,
                  }}
                >
                  <span
                    className="bt-text-main truncate pr-4 font-medium"
                    style={{
                      color: e.paid ? (isDark ? "#475569" : "#9CA3AF") : undefined,
                      textDecoration: e.paid ? "line-through" : "none",
                    }}
                  >
                    {e.name}
                  </span>
                  <span
                    className="bt-text-main bt-data text-right tabular-nums"
                    style={{
                      color: e.paid ? (isDark ? "#475569" : "#9CA3AF") : undefined,
                      textDecoration: e.paid ? "line-through" : "none",
                    }}
                  >
                    ₱{fmt(e.amount)}
                  </span>
                </button>
              ))}

              {/* Total row */}
              <div
                className="grid px-5 py-3.5 text-sm font-semibold"
                style={{
                  gridTemplateColumns: "1fr auto",
                  background: isDark ? "#1E2D4A" : "#F0FDF9",
                  borderTop: `1px solid ${borderCol}`,
                }}
              >
                <span className="bt-text-teal text-xs uppercase tracking-wider font-semibold">Total Spent</span>
                <span className="bt-text-teal bt-data text-right tabular-nums">₱{fmt(total)}</span>
              </div>

              {/* Remaining row */}
              <div
                className="grid px-5 py-3.5 text-sm font-bold"
                style={{ gridTemplateColumns: "1fr auto", borderTop: `1px solid ${borderCol}` }}
              >
                <span className="bt-text-muted text-xs uppercase tracking-wider font-semibold">Remaining</span>
                <span
                  className="bt-data text-right tabular-nums font-bold"
                  style={{ color: budget === 0 ? undefined : remaining >= 0 ? (isDark ? "#00E699" : "#00C97A") : "#FF5252" }}
                >
                  {budget > 0 ? `₱${fmt(remaining)}` : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FAB */}
      {expenses.length > 0 && (
        <button
          onClick={() => setShowItemModal(true)}
          className="bt-btn-primary fixed bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ boxShadow: "0 8px 24px rgba(13,148,136,0.35), 0 2px 8px rgba(0,0,0,0.3)" }}
          aria-label="Add expense"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="18" />
            <line x1="4" y1="11" x2="18" y2="11" />
          </svg>
        </button>
      )}

      {/* ── Budget modal ─────────────────────────────────────────── */}
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
              <button onClick={() => { setShowBudgetModal(false); setBudgetInput(""); }} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSetBudget} disabled={!budgetInput.trim()} className="bt-btn-primary flex-1 py-2.5">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Item modal ───────────────────────────────────────────── */}
      {showItemModal && (
        <Modal
          title={editingExpense ? "Edit Expense" : "Add Expense"}
          onClose={closeItemModal}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="item-name" className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Item</label>
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
              <label htmlFor="item-amount" className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Amount (₱)</label>
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
              <>
                <button
                  onClick={() => { togglePaid(editingExpense.id); closeItemModal(); }}
                  className="w-full py-2 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: "#0D9488" }}
                >
                  {expenses.find((e) => e.id === editingExpense.id)?.paid ? "Mark as unpaid" : "Mark as paid ✓"}
                </button>
                <button
                  onClick={() => { deleteExpense(editingExpense.id); closeItemModal(); }}
                  className="w-full py-2 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: "#FF5252" }}
                >
                  Delete this item
                </button>
              </>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={closeItemModal} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
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
