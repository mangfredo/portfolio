"use client";

import "../../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import {
  useSavings, useSavingsDeposits, calcSavingsMetrics,
  type SavingsGoal, type GoalStatus,
} from "@/hooks/useSavingsStore";
import BudgetShell from "@/components/budget/BudgetShell";
import Modal from "@/components/budget/Modal";
import { ConfirmModal } from "@/components/budget/BudgetModal";

interface Props { id: string; }

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLES: Record<GoalStatus, { label: string; color: string }> = {
  achieved:   { label: "Achieved ✓", color: "#00C97A" },
  "on-track": { label: "On Track",   color: "#0D9488" },
  behind:     { label: "Behind",     color: "#EF4444" },
  "no-date":  { label: "In Progress",color: "#94A3B8" },
};

function buildGrowthCurve(goal: SavingsGoal, depositDates: { date: string; amount: number }[]) {
  // Build a cumulative balance curve sorted by date
  const sorted = [...depositDates].sort((a, b) => a.date.localeCompare(b.date));
  let balance = goal.currentAmount;
  const points: { label: string; balance: number }[] = [
    { label: "Start", balance },
  ];
  for (const d of sorted) {
    balance += d.amount;
    points.push({
      label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      balance: parseFloat(balance.toFixed(2)),
    });
  }
  return points;
}

export default function SavingsDetail({ id }: Props) {
  return (
    <BudgetShell>
      <SavingsDetailInner id={id} />
    </BudgetShell>
  );
}

function SavingsDetailInner({ id }: Props) {
  const router = useRouter();
  const { theme, currencySymbol } = useBudgetSettingsCtx();
  const isDark    = theme === "dark";
  const cardBg    = isDark ? "#111D35" : "#FFFFFF";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "#CBD5E1";
  const textMuted = isDark ? "#94A3B8" : "#415A77";
  const teal      = isDark ? "#2DD4BF" : "#0D9488";

  const { goals, deleteGoal } = useSavings();
  const { deposits, addDeposit, deleteDeposit } = useSavingsDeposits(id);
  const goal = goals.find((g) => g.id === id);

  const [showDeleteGoal, setShowDeleteGoal]     = useState(false);
  const [showAddDeposit, setShowAddDeposit]     = useState(false);
  const [depAmount, setDepAmount]               = useState("");
  const [depDate, setDepDate]                   = useState(new Date().toISOString().slice(0, 10));
  const [depNote, setDepNote]                   = useState("");
  const [deleteDepositId, setDeleteDepositId]   = useState<string | null>(null);

  if (!goal) {
    return (
      <div className="px-6 pt-16 text-center">
        <p className="bt-text-muted">Savings goal not found.</p>
        <button onClick={() => router.push("/budget-tracker/savings")} className="bt-btn-primary mt-4 px-6 py-2">
          Back to Goals
        </button>
      </div>
    );
  }

  const metrics    = calcSavingsMetrics(goal, deposits);
  const status     = STATUS_STYLES[metrics.status];
  const curveData  = buildGrowthCurve(goal, deposits);

  const progressColor =
    metrics.status === "achieved" ? "#00C97A"
    : metrics.status === "on-track" ? teal
    : metrics.status === "behind" ? "#EF4444"
    : teal;

  const handleAddDeposit = () => {
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 0) return;
    addDeposit(depDate, amt, depNote.trim() || undefined);
    setDepAmount(""); setDepNote("");
    setDepDate(new Date().toISOString().slice(0, 10));
    setShowAddDeposit(false);
  };

  const metricCards = [
    {
      label: "Total Saved",
      value: `${currencySymbol}${fmt(metrics.totalSaved)}`,
      sub: `of ${currencySymbol}${fmt(goal.targetAmount)} target`,
      color: teal,
    },
    {
      label: "Remaining",
      value: metrics.status === "achieved" ? "Complete!" : `${currencySymbol}${fmt(metrics.remaining)}`,
      sub: `${metrics.pctComplete.toFixed(1)}% complete`,
      color: metrics.status === "achieved" ? "#00C97A" : isDark ? "#E2E8F0" : "#0F172A",
    },
    {
      label: "Projected Completion",
      value: metrics.projectedDate
        ? metrics.projectedDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })
        : "—",
      sub: goal.monthlyContribution
        ? `${currencySymbol}${fmt(goal.monthlyContribution)}/mo planned`
        : "Set a monthly contribution",
      color: isDark ? "#E2E8F0" : "#0F172A",
    },
    {
      label: "Monthly Needed",
      value: metrics.monthlyNeeded !== null
        ? `${currencySymbol}${fmt(metrics.monthlyNeeded)}`
        : "—",
      sub: goal.targetDate
        ? `to hit ${new Date(goal.targetDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`
        : "No target date set",
      color: metrics.status === "behind" ? "#EF4444" : isDark ? "#E2E8F0" : "#0F172A",
    },
  ];

  return (
    <>
      <div className="px-6 pt-8 pb-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => router.push("/budget-tracker/savings")}
              className="bt-text-muted text-xs font-medium mb-2 flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              ← All Goals
            </button>
            <div className="flex items-center gap-3">
              <h2 className="bt-text-main text-2xl font-semibold tracking-tight">{goal.name}</h2>
              <span
                className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${status.color}22`,
                  color: status.color,
                }}
              >
                {status.label}
              </span>
            </div>
            {goal.targetDate && (
              <p className="bt-text-muted text-sm mt-0.5">
                Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowDeleteGoal(true)}
            className="bt-text-muted text-xs font-medium transition-opacity hover:opacity-70 mt-1"
          >
            Delete goal
          </button>
        </div>

        {/* Progress bar */}
        <div className="bt-card p-5 mb-6" style={{ background: cardBg, border: `1px solid ${borderCol}` }}>
          <div className="flex justify-between items-center mb-2">
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium">Savings Progress</p>
            <span className="bt-data text-sm font-semibold" style={{ color: progressColor }}>
              {metrics.pctComplete.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: isDark ? "#334155" : "#E2E8F0" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${metrics.pctComplete}%`, background: progressColor }}
            />
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {metricCards.map((c) => (
            <div key={c.label} className="bt-card p-4" style={{ background: cardBg, border: `1px solid ${borderCol}` }}>
              <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-2">{c.label}</p>
              <p className="bt-data font-bold text-lg leading-tight" style={{ color: c.color }}>{c.value}</p>
              <p className="bt-text-muted text-xs mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Growth chart */}
        {curveData.length > 1 && (
          <div className="bt-card p-5 mb-8" style={{ background: cardBg, border: `1px solid ${borderCol}` }}>
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium mb-4">Savings Growth</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={curveData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="savingsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={teal} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={teal} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: textMuted }}
                  tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
                  axisLine={false} tickLine={false} width={52}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? "rgba(15,23,42,0.92)" : "#FFFFFF",
                    border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
                    borderRadius: "8px", fontSize: "12px",
                    color: isDark ? "#E2E8F0" : "#0F172A",
                  }}
                  formatter={(v: number) => [`${currencySymbol}${fmt(v)}`, "Saved"]}
                />
                <Area
                  type="monotone" dataKey="balance" stroke={teal}
                  strokeWidth={2} fill="url(#savingsArea)" dot={false}
                  activeDot={{ r: 4, fill: teal, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Deposit history */}
        <div className="bt-card" style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: "8px", overflow: "hidden" }}>
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ background: isDark ? "#1E2D4A" : "#1B263B" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-white">Deposit History</p>
            <button
              onClick={() => setShowAddDeposit(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-md"
              style={{ background: teal, color: "#FFFFFF" }}
            >
              + Log Deposit
            </button>
          </div>

          {deposits.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="bt-text-muted text-sm">No deposits logged yet.</p>
            </div>
          ) : (
            <div>
              <div
                className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  gridTemplateColumns: "1fr 1fr auto",
                  background: isDark ? "#1E2D4A" : "#1B263B",
                  color: "#F8FAFC", letterSpacing: "0.06em",
                }}
              >
                <span>Date</span><span>Amount</span><span>Note</span>
              </div>
              {[...deposits].reverse().map((d, idx) => (
                <div
                  key={d.id}
                  className="grid px-5 py-3 text-sm items-center"
                  style={{
                    gridTemplateColumns: "1fr 1fr auto",
                    borderBottom: idx < deposits.length - 1
                      ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9"}` : "none",
                    background: idx % 2 === 0
                      ? "transparent"
                      : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                  }}
                >
                  <span className="bt-text-muted text-xs bt-data">
                    {new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="bt-text-main bt-data font-medium">{currencySymbol}{fmt(d.amount)}</span>
                  <div className="flex items-center gap-2">
                    <span className="bt-text-muted text-xs truncate max-w-[100px]">{d.note ?? "—"}</span>
                    <button
                      onClick={() => setDeleteDepositId(d.id)}
                      className="text-xs opacity-40 hover:opacity-90 transition-opacity"
                      style={{ color: "#FF5252" }}
                      aria-label="Delete deposit"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add deposit modal */}
      {showAddDeposit && (
        <Modal title="Log Deposit" onClose={() => setShowAddDeposit(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                Amount ({currencySymbol})
              </label>
              <input
                type="number" inputMode="decimal"
                value={depAmount} onChange={(e) => setDepAmount(e.target.value)}
                placeholder="0.00" autoFocus className="bt-input bt-data"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddDeposit(); }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Date</label>
              <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} className="bt-input" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Note (optional)</label>
              <input
                type="text" value={depNote} onChange={(e) => setDepNote(e.target.value)}
                placeholder="e.g. Bonus saved" className="bt-input"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAddDeposit(false)} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
              <button
                onClick={handleAddDeposit}
                disabled={!depAmount || parseFloat(depAmount) <= 0}
                className="bt-btn-primary flex-1 py-2.5"
              >
                Log Deposit
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete deposit confirm */}
      {deleteDepositId && (
        <ConfirmModal
          title="Delete Deposit"
          message="Remove this deposit from the history? This cannot be undone."
          confirmLabel="Delete"
          danger
          isDark={isDark}
          onConfirm={() => { deleteDeposit(deleteDepositId); setDeleteDepositId(null); }}
          onCancel={() => setDeleteDepositId(null)}
        />
      )}

      {/* Delete goal confirm */}
      {showDeleteGoal && (
        <ConfirmModal
          title={`Delete "${goal.name}"?`}
          message="This will permanently remove this goal and all its deposit history. This cannot be undone."
          confirmLabel="Delete"
          danger
          isDark={isDark}
          onConfirm={() => { deleteGoal(id); router.replace("/budget-tracker/savings"); }}
          onCancel={() => setShowDeleteGoal(false)}
        />
      )}
    </>
  );
}
