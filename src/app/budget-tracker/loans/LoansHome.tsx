"use client";

import "../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import {
  useLoans, useLoanPayments, calcLoanMetrics,
  type Loan, type PaymentFrequency,
} from "@/hooks/useLoanStore";
import BudgetShell from "@/components/budget/BudgetShell";
import Modal from "@/components/budget/Modal";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LoansHome() {
  return (
    <BudgetShell>
      <LoansHomeInner />
    </BudgetShell>
  );
}

function LoansHomeInner() {
  const router = useRouter();
  const { theme, currencySymbol } = useBudgetSettingsCtx();
  const isDark    = theme === "dark";
  const cardBg    = isDark ? "#111D35" : "#FFFFFF";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "#CBD5E1";
  const textMain  = isDark ? "#F8FAFC" : "#0F172A";

  const { loans, addLoan } = useLoans();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", principal: "", interestRate: "", monthlyPayment: "",
    paymentFrequency: "monthly" as PaymentFrequency,
    startDate: new Date().toISOString().slice(0, 10),
  });

  const resetForm = () => setForm({
    name: "", principal: "", interestRate: "", monthlyPayment: "",
    paymentFrequency: "monthly",
    startDate: new Date().toISOString().slice(0, 10),
  });

  const handleAdd = () => {
    const p = parseNumeric(form.principal);
    const r = parseNumeric(form.interestRate);
    const m = parseNumeric(form.monthlyPayment);
    if (!form.name.trim() || isNaN(p) || isNaN(r) || isNaN(m)) return;
    const loan = addLoan({
      name: form.name.trim(), principal: p, interestRate: r,
      monthlyPayment: m, paymentFrequency: form.paymentFrequency,
      startDate: form.startDate,
    });
    resetForm(); setShowAdd(false);
    router.push(`/budget-tracker/loans/${loan.id}`);
  };

  const fp = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <>
      <div className="px-6 pt-8 pb-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="bt-text-muted text-xs uppercase tracking-[0.14em] font-medium mb-1">Finance</p>
          <h2 className="bt-text-main text-2xl font-semibold tracking-tight">Loan Repayment</h2>
          <p className="bt-text-muted text-sm mt-1">Track your loans and stay on top of your payoff schedule.</p>
        </div>

        {loans.length === 0 ? (
          <div className="bt-card flex flex-col items-center justify-center py-20 px-8 text-center" style={{ borderStyle: "dashed" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-xl"
              style={{ background: isDark ? "#1E293B" : "#EAEFF5", color: isDark ? "#F87171" : "#EF4444" }}>⊕</div>
            <p className="bt-text-main font-semibold text-base mb-1">No loans yet</p>
            <p className="bt-text-muted text-sm mb-6">Add your first loan to start tracking repayment.</p>
            <button onClick={() => setShowAdd(true)} className="bt-btn-primary px-6 py-2.5">+ Add Loan</button>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} currencySymbol={currencySymbol}
                cardBg={cardBg} borderCol={borderCol} textMain={textMain} isDark={isDark}
                onClick={() => router.push(`/budget-tracker/loans/${loan.id}`)} />
            ))}
          </div>
        )}
      </div>

      {loans.length > 0 && (
        <button onClick={() => setShowAdd(true)}
          className="bt-btn-primary fixed bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ boxShadow: "0 8px 24px rgba(13,148,136,0.35), 0 2px 8px rgba(0,0,0,0.3)" }}
          aria-label="Add loan">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="18" /><line x1="4" y1="11" x2="18" y2="11" />
          </svg>
        </button>
      )}

      {showAdd && (
        <Modal title="Add Loan" onClose={() => { setShowAdd(false); resetForm(); }}>
          <div className="space-y-4">
            <Field label="Loan Name">
              <input type="text" {...fp("name")} placeholder="e.g. Car Loan" autoFocus className="bt-input"
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
            </Field>
            <Field label={`Principal Amount (${currencySymbol})`}>
              <NumericInput {...fp("principal")} placeholder="0.00" className="bt-input bt-data" />
            </Field>
            <Field label="Annual Interest Rate (%)">
              <NumericInput {...fp("interestRate")} placeholder="e.g. 12" className="bt-input bt-data" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Payment Amount (${currencySymbol})`}>
                <NumericInput {...fp("monthlyPayment")} placeholder="0.00" className="bt-input bt-data" />
              </Field>
              <Field label="Frequency">
                <select {...fp("paymentFrequency")} className="bt-input">
                  <option value="monthly">Once a month</option>
                  <option value="twice-monthly">Twice a month</option>
                </select>
              </Field>
            </div>
            <Field label="Start Date">
              <input type="date" {...fp("startDate")} className="bt-input" />
            </Field>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="bt-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleAdd}
                disabled={!form.name.trim() || !form.principal || !form.interestRate || !form.monthlyPayment}
                className="bt-btn-primary flex-1 py-2.5">Add Loan</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>{label}</label>
      {children}
    </div>
  );
}

// Fetches its own payments so the list always shows live data
function LoanCard({ loan, currencySymbol, cardBg, borderCol, textMain, isDark, onClick }: {
  loan: Loan; currencySymbol: string; cardBg: string; borderCol: string; textMain: string; isDark: boolean; onClick: () => void;
}) {
  const { payments } = useLoanPayments(loan.id);
  const metrics = calcLoanMetrics(loan, payments);
  const progressColor = metrics.pctPaid >= 100 ? "#00C97A" : metrics.pctPaid > 50 ? "#0D9488" : "#F59E0B";
  const freqLabel = loan.paymentFrequency === "twice-monthly" ? "×2/mo" : "/mo";

  return (
    <button onClick={onClick} className="bt-card w-full text-left px-5 py-4 group"
      style={{ borderRadius: "8px", background: cardBg, border: `1px solid ${borderCol}`, color: textMain,
        boxShadow: isDark ? "0 4px 20px -2px rgba(0,0,0,0.5)" : "0 1px 3px 0 rgba(11,19,37,0.05)",
        display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="bt-text-main font-semibold text-sm">{loan.name}</p>
          <span className="bt-text-muted text-xs bt-data">{currencySymbol}{fmt(metrics.currentBalance)} remaining</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: isDark ? "#334155" : "#E2E8F0" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${metrics.pctPaid}%`, background: progressColor }} />
        </div>
        <div className="flex gap-4 text-xs bt-text-muted">
          <span>{metrics.pctPaid.toFixed(1)}% paid</span>
          <span>·</span>
          <span>{metrics.payoffDate
            ? `Payoff ${metrics.payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`
            : "Check payment"}</span>
          <span>·</span>
          <span className="bt-data">{currencySymbol}{fmt(loan.monthlyPayment)}{freqLabel}</span>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        className="transition-transform group-hover:translate-x-0.5 flex-shrink-0" style={{ color: "#CBD5E1" }}>
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
