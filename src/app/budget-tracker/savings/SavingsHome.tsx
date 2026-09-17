"use client";

import "../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import {
  useSavings, calcSavingsMetrics,
  type SavingsGoal, type GoalStatus,
} from "@/hooks/useSavingsStore";
import BudgetShell from "@/components/budget/BudgetShell";
import Modal from "@/components/budget/Modal";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLES: Record<GoalStatus, { label: string; bg: string; color: string }> = {
  achieved:  { label: "Achieved ✓", bg: "rgba(0,201,122,0.15)",  color: "#00C97A" },
  "on-track":{ label: "On Track",   bg: "rgba(13,148,136,0.15)", color: "#0D9488" },
  behind:    { label: "Behind",     bg: "rgba(239,68,68,0.15)",  color: "#EF4444" },
  "no-date": { label: "In Progress",bg: "rgba(148,163,184,0.12)",color: "#94A3B8" },
};

export default function SavingsHome() {
  return (
    <BudgetShell>
      <SavingsHomeInner />
    </BudgetShell>
  );
}

function SavingsHomeInner() {
  const router = useRouter();
  const { theme, currencySymbol } = useBudgetSettingsCtx();
  const isDark    = theme === "dark";
  const cardBg    = isDark ? "#111D35" : "#FFFFFF";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "#CBD5E1";
  const textMain  = isDark ? "#F8FAFC" : "#0F172A";

  const { goals, addGoal } = useSavings();
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    name: "", targetAmount: "", currentAmount: "0",
    targetDate: "", monthlyContribution: "",
  });

  const resetForm = () => setForm({
    name: "", targetAmount: "", currentAmount: "0",
    targetDate: "", monthlyContribution: "",
  });

  const handleAdd = () => {
    const target  = parseNumeric(form.targetAmount);
    const current = parseNumeric(form.currentAmount) || 0;
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    const goal = addGoal({
      name: form.name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate: form.targetDate || undefined,
      monthlyContribution: form.monthlyContribution
        ? parseNumeric(form.monthlyContribution)
        : undefined,
    });
    resetForm();
    setShowAdd(false);
    router.push(`/budget-tracker/savings/${goal.id}`);
  };

  const fieldProps = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <>
      <div className="px-6 pt-8 pb-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="bt-text-muted text-xs uppercase tracking-[0.14em] font-medium mb-1">
            Finance
          </p>
          <h2 className="bt-text-main text-2xl font-semibold tracking-tight">
            Savings Goals
          </h2>
          <p className="bt-text-muted text-sm mt-1">
            Track your progress toward financial targets.
          </p>
        </div>

        {goals.length === 0 ? (
          <div
            className="bt-card flex flex-col items-center justify-center py-20 px-8 text-center"
            style={{ borderStyle: "dashed" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-xl"
              style={{ background: isDark ? "#1E293B" : "#EAEFF5", color: isDark ? "#2DD4BF" : "#0D9488" }}
            >
              ◎
            </div>
            <p className="bt-text-main font-semibold text-base mb-1">No savings goals yet</p>
            <p className="bt-text-muted text-sm mb-6">
              Create your first goal and start saving toward it.
            </p>
            <button onClick={() => setShowAdd(true)} className="bt-btn-primary px-6 py-2.5">
              + Add Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currencySymbol={currencySymbol}
                cardBg={cardBg}
                borderCol={borderCol}
                textMain={textMain}
                isDark={isDark}
                onClick={() => router.push(`/budget-tracker/savings/${goal.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {goals.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="bt-btn-primary fixed bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ boxShadow: "0 8px 24px rgba(13,148,136,0.35), 0 2px 8px rgba(0,0,0,0.3)" }}
          aria-label="Add goal"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="18" /><line x1="4" y1="11" x2="18" y2="11" />
          </svg>
        </button>
      )}

      {/* Add Goal Modal */}
      {showAdd && (
        <Modal title="Add Savings Goal" onClose={() => { setShowAdd(false); resetForm(); }}>
          <div className="space-y-4">
            <Field label="Goal Name">
              <input
                type="text" {...fieldProps("name")} placeholder="e.g. Emergency Fund"
                autoFocus className="bt-input"
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
            </Field>
            <Field label={`Target Amount (${currencySymbol})`}>
              <NumericInput {...fieldProps("targetAmount")} placeholder="0.00" className="bt-input bt-data" />
            </Field>
            <Field label={`Amount Already Saved (${currencySymbol})`}>
              <NumericInput {...fieldProps("currentAmount")} placeholder="0.00" className="bt-input bt-data" />
            </Field>
            <Field label="Target Date (optional)">
              <input type="date" {...fieldProps("targetDate")} className="bt-input" />
            </Field>
            <Field label={`Monthly Contribution (${currencySymbol}, optional)`}>
              <NumericInput {...fieldProps("monthlyContribution")} placeholder="0.00" className="bt-input bt-data" />
            </Field>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!form.name.trim() || !form.targetAmount}
                className="bt-btn-primary flex-1 py-2.5"
              >
                Add Goal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function GoalCard({
  goal, currencySymbol, cardBg, borderCol, textMain, isDark, onClick,
}: {
  goal: SavingsGoal;
  currencySymbol: string;
  cardBg: string;
  borderCol: string;
  textMain: string;
  isDark: boolean;
  onClick: () => void;
}) {
  // No deposits on list page — shows goal-level metrics
  const metrics = calcSavingsMetrics(goal, []);
  const status  = STATUS_STYLES[metrics.status];

  const progressColor =
    metrics.status === "achieved" ? "#00C97A"
    : metrics.status === "on-track" ? "#0D9488"
    : metrics.status === "behind" ? "#EF4444"
    : isDark ? "#2DD4BF" : "#0D9488";

  return (
    <button
      onClick={onClick}
      className="bt-card w-full text-left px-5 py-4 group"
      style={{
        borderRadius: "8px", background: cardBg,
        border: `1px solid ${borderCol}`, color: textMain,
        boxShadow: isDark ? "0 4px 20px -2px rgba(0,0,0,0.5)" : "0 1px 3px 0 rgba(11,19,37,0.05)",
        display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center",
      }}
    >
      <div>
        {/* Name + status badge */}
        <div className="flex items-center gap-2 mb-2">
          <p className="bt-text-main font-semibold text-sm">{goal.name}</p>
          <span
            className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: isDark ? "#334155" : "#E2E8F0" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${metrics.pctComplete}%`, background: progressColor }}
          />
        </div>

        {/* Meta row */}
        <div className="flex gap-3 text-xs bt-text-muted flex-wrap">
          <span className="bt-data">
            {currencySymbol}{fmt(metrics.totalSaved)} / {currencySymbol}{fmt(goal.targetAmount)}
          </span>
          <span>·</span>
          <span>{metrics.pctComplete.toFixed(1)}% complete</span>
          {goal.targetDate && (
            <>
              <span>·</span>
              <span>
                Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            </>
          )}
        </div>
      </div>

      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        className="transition-transform group-hover:translate-x-0.5 flex-shrink-0"
        style={{ color: "#CBD5E1" }}
      >
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
