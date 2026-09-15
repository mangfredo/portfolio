"use client";

import "../../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import {
  useLoans, useLoanPayments, calcLoanMetrics, buildLoanCurve,
  monthlyOutflow, type PaymentFrequency,
} from "@/hooks/useLoanStore";
import BudgetShell from "@/components/budget/BudgetShell";
import Modal from "@/components/budget/Modal";
import { ConfirmModal } from "@/components/budget/BudgetModal";

interface Props { id: string; }
const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LoanDetail({ id }: Props) {
  return (
    <BudgetShell>
      <LoanDetailInner id={id} />
    </BudgetShell>
  );
}

function LoanDetailInner({ id }: Props) {
  const router = useRouter();
  const { theme, currencySymbol } = useBudgetSettingsCtx();
  const isDark    = theme === "dark";
  const cardBg    = isDark ? "#111D35" : "#FFFFFF";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "#CBD5E1";
  const textMuted = isDark ? "#94A3B8" : "#415A77";
  const teal      = isDark ? "#2DD4BF" : "#0D9488";

  const { loans, updateLoan, deleteLoan } = useLoans();
  const { payments, addPayment, deletePayment } = useLoanPayments(id);
  const loan = loans.find((l) => l.id === id);

  const [showDeleteLoan, setShowDeleteLoan]   = useState(false);
  const [showAddPayment, setShowAddPayment]   = useState(false);
  const [showEditLoan, setShowEditLoan]       = useState(false);
  const [payAmount, setPayAmount]             = useState("");
  const [payDate, setPayDate]                 = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote]                 = useState("");
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  // Edit loan form
  const [editForm, setEditForm] = useState({ monthlyPayment: "", paymentFrequency: "monthly" as PaymentFrequency });

  if (!loan) {
    return (
      <div className="px-6 pt-16 text-center">
        <p className="bt-text-muted">Loan not found.</p>
        <button onClick={() => router.push("/budget-tracker/loans")} className="bt-btn-primary mt-4 px-6 py-2">Back to Loans</button>
      </div>
    );
  }

  const metrics     = calcLoanMetrics(loan, payments);
  const curveData   = buildLoanCurve(loan, payments);
  // Find where actual ends and projected begins (for chart styling)
  const splitIdx    = curveData.findLastIndex((p) => p.actual);

  const progressColor = metrics.pctPaid >= 100 ? "#00C97A"
    : metrics.pctPaid > 50 ? teal : "#F59E0B";

  const freqLabel = loan.paymentFrequency === "twice-monthly"
    ? `${currencySymbol}${fmt(loan.monthlyPayment)} × 2/mo (${currencySymbol}${fmt(monthlyOutflow(loan))}/mo total)`
    : `${currencySymbol}${fmt(loan.monthlyPayment)}/mo`;

  const handleAddPayment = () => {
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) return;
    addPayment(payDate, amt, payNote.trim() || undefined);
    setPayAmount(""); setPayNote("");
    setPayDate(new Date().toISOString().slice(0, 10));
    setShowAddPayment(false);
  };

  const handleEditLoan = () => {
    const m = parseFloat(editForm.monthlyPayment);
    if (isNaN(m) || m <= 0) return;
    updateLoan(id, { monthlyPayment: m, paymentFrequency: editForm.paymentFrequency });
    setShowEditLoan(false);
  };

  const metricCards = [
    {
      label: "Remaining Balance",
      value: `${currencySymbol}${fmt(metrics.currentBalance)}`,
      sub: `of ${currencySymbol}${fmt(loan.principal)} original`,
      color: "#FF5252",
    },
    {
      label: "Total Paid",
      value: `${currencySymbol}${fmt(metrics.totalPaid)}`,
      sub: `${payments.length} payment${payments.length !== 1 ? "s" : ""} logged`,
      color: teal,
    },
    {
      label: "Interest Paid",
      value: `${currencySymbol}${fmt(metrics.interestPaidSoFar)}`,
      sub: `${loan.interestRate}% annual rate`,
      color: "#F59E0B",
    },
    {
      label: "Payoff Date",
      value: metrics.payoffDate
        ? metrics.payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })
        : "—",
      sub: isFinite(metrics.remainingMonths) ? `${metrics.remainingMonths} months left` : "Increase payment",
      color: isDark ? "#E2E8F0" : "#0F172A",
    },
  ];

  return (
    <>
      <div className="px-6 pt-8 pb-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={() => router.push("/budget-tracker/loans")}
              className="bt-text-muted text-xs font-medium mb-2 flex items-center gap-1 hover:opacity-70 transition-opacity">
              ← All Loans
            </button>
            <h2 className="bt-text-main text-2xl font-semibold tracking-tight">{loan.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="bt-text-muted text-sm">{loan.interestRate}% annual · {freqLabel}</p>
              <button onClick={() => { setEditForm({ monthlyPayment: String(loan.monthlyPayment), paymentFrequency: loan.paymentFrequency }); setShowEditLoan(true); }}
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: isDark ? "#1E293B" : "#F1F5F9", color: teal }}>
                Edit
              </button>
            </div>
          </div>
          <button onClick={() => setShowDeleteLoan(true)}
            className="bt-text-muted text-xs font-medium transition-opacity hover:opacity-70 mt-1">
            Delete loan
          </button>
        </div>

        {/* Progress bar */}
        <div className="bt-card p-5 mb-6" style={{ background: cardBg, border: `1px solid ${borderCol}` }}>
          <div className="flex justify-between items-center mb-2">
            <p className="bt-text-muted text-xs uppercase tracking-wider font-medium">Repayment Progress</p>
            <span className="bt-data text-sm font-semibold" style={{ color: progressColor }}>
              {metrics.pctPaid.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: isDark ? "#334155" : "#E2E8F0" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${metrics.pctPaid}%`, background: progressColor }} />
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

        {/* Balance chart — historical (solid) + projected (dashed) */}
        {curveData.length > 1 && (
          <div className="bt-card p-5 mb-8" style={{ background: cardBg, border: `1px solid ${borderCol}` }}>
            <div className="flex items-center justify-between mb-4">
              <p className="bt-text-muted text-xs uppercase tracking-wider font-medium">Balance Over Time</p>
              <div className="flex gap-4 text-xs bt-text-muted">
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5" style={{ background: teal }}></span>Actual</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: isDark ? "#334155" : "#CBD5E1" }}></span>Projected</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={curveData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: textMuted }} axisLine={false} tickLine={false}
                  interval={Math.floor(curveData.length / 8)} />
                <YAxis tick={{ fontSize: 10, fill: textMuted }}
                  tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
                  axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={{ background: isDark ? "rgba(15,23,42,0.92)" : "#FFFFFF",
                    border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
                    borderRadius: "8px", fontSize: "12px", color: isDark ? "#E2E8F0" : "#0F172A" }}
                  formatter={(v: number) => [`${currencySymbol}${fmt(v)}`, "Balance"]}
                />
                {/* Vertical line separating actual from projected */}
                {splitIdx > 0 && splitIdx < curveData.length - 1 && (
                  <ReferenceLine x={curveData[splitIdx].label}
                    stroke={isDark ? "#334155" : "#CBD5E1"} strokeDasharray="4 2" />
                )}
                {/* Actual (solid) */}
                <Line
                  type="monotone" dataKey="balance"
                  stroke={teal} strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: teal, strokeWidth: 0 }}
                  strokeDasharray={undefined}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment history */}
        <div className="bt-card" style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: "8px", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: isDark ? "#1E2D4A" : "#1B263B" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-white">Payment History</p>
            <button onClick={() => setShowAddPayment(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-md"
              style={{ background: teal, color: "#FFFFFF" }}>
              + Log Payment
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="px-5 py-10 text-center"><p className="bt-text-muted text-sm">No payments logged yet.</p></div>
          ) : (
            <div>
              <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ gridTemplateColumns: "1fr 1fr auto",
                  background: isDark ? "#1E2D4A" : "#1B263B", color: "#F8FAFC", letterSpacing: "0.06em" }}>
                <span>Date</span><span>Amount</span><span>Note</span>
              </div>
              {[...payments].reverse().map((p, idx) => (
                <div key={p.id} className="grid px-5 py-3 text-sm items-center"
                  style={{ gridTemplateColumns: "1fr 1fr auto",
                    borderBottom: idx < payments.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9"}` : "none",
                    background: idx % 2 === 0 ? "transparent" : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                  <span className="bt-text-muted text-xs bt-data">
                    {new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="bt-text-main bt-data font-medium">{currencySymbol}{fmt(p.amount)}</span>
                  <div className="flex items-center gap-2">
                    <span className="bt-text-muted text-xs truncate max-w-[100px]">{p.note ?? "—"}</span>
                    <button onClick={() => setDeletePaymentId(p.id)}
                      className="text-xs opacity-40 hover:opacity-90 transition-opacity" style={{ color: "#FF5252" }}
                      aria-label="Delete payment">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add payment modal */}
      {showAddPayment && (
        <Modal title="Log Payment" onClose={() => setShowAddPayment(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                Amount ({currencySymbol})
              </label>
              <input type="number" inputMode="decimal" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00" autoFocus className="bt-input bt-data"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddPayment(); }} />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Date</label>
              <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="bt-input" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Note (optional)</label>
              <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="e.g. Extra payment" className="bt-input" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAddPayment(false)} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleAddPayment} disabled={!payAmount || parseFloat(payAmount) <= 0}
                className="bt-btn-primary flex-1 py-2.5">Log Payment</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit payment plan modal — only affects future projections */}
      {showEditLoan && (
        <Modal title="Edit Payment Plan" onClose={() => setShowEditLoan(false)}>
          <div className="space-y-4">
            <p className="bt-text-muted text-xs" style={{ lineHeight: 1.6 }}>
              Changing the payment plan only affects future projections. Existing logged payments and their balance impact remain unchanged.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                  Payment Amount ({currencySymbol})
                </label>
                <input type="number" inputMode="decimal" value={editForm.monthlyPayment}
                  onChange={(e) => setEditForm((f) => ({ ...f, monthlyPayment: e.target.value }))}
                  autoFocus className="bt-input bt-data" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Frequency</label>
                <select value={editForm.paymentFrequency}
                  onChange={(e) => setEditForm((f) => ({ ...f, paymentFrequency: e.target.value as PaymentFrequency }))}
                  className="bt-input">
                  <option value="monthly">Once a month</option>
                  <option value="twice-monthly">Twice a month</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowEditLoan(false)} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleEditLoan}
                disabled={!editForm.monthlyPayment || parseFloat(editForm.monthlyPayment) <= 0}
                className="bt-btn-primary flex-1 py-2.5">Save Plan</button>
            </div>
          </div>
        </Modal>
      )}

      {deletePaymentId && (
        <ConfirmModal title="Delete Payment"
          message="Remove this payment from the history? This cannot be undone."
          confirmLabel="Delete" danger isDark={isDark}
          onConfirm={() => { deletePayment(deletePaymentId); setDeletePaymentId(null); }}
          onCancel={() => setDeletePaymentId(null)} />
      )}

      {showDeleteLoan && (
        <ConfirmModal title={`Delete "${loan.name}"?`}
          message="This will permanently remove this loan and all its payment history. This cannot be undone."
          confirmLabel="Delete" danger isDark={isDark}
          onConfirm={() => { deleteLoan(id); router.replace("/budget-tracker/loans"); }}
          onCancel={() => setShowDeleteLoan(false)} />
      )}
    </>
  );
}
