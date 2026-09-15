"use client";

import { useEffect, useState } from "react";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";

// ── Data types ─────────────────────────────────────────────────────────────

export type PaymentFrequency = "monthly" | "twice-monthly";

export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number;        // annual %, e.g. 12 = 12%
  monthlyPayment: number;      // current planned payment per period
  paymentFrequency: PaymentFrequency;
  startDate: string;           // ISO date string
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

// ── localStorage ───────────────────────────────────────────────────────────

const LOANS_KEY   = "bt_loans";
const paymentsKey = (id: string) => `bt_loan_payments_${id}`;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, v: T) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /**/ }
}

// ── Calculation helpers ────────────────────────────────────────────────────

export function periodsPerMonth(freq: PaymentFrequency): number {
  return freq === "twice-monthly" ? 2 : 1;
}

/** Total cash outflow per calendar month */
export function monthlyOutflow(loan: Loan): number {
  return loan.monthlyPayment * periodsPerMonth(loan.paymentFrequency);
}

/**
 * Compute true remaining balance by simulating month-by-month with
 * ACTUAL logged payments — not the theoretical amortization schedule.
 *
 * Each calendar month:
 *   balance += balance × (annualRate / 12)
 *   balance -= sum of payments made that month
 *
 * This means changing monthlyPayment ONLY affects future projections,
 * never retroactive history.
 */
export function calcActualBalance(loan: Loan, payments: LoanPayment[]): number {
  if (payments.length === 0) return loan.principal;

  const sorted = [...payments].sort((a, b) => a.date.localeCompare(b.date));
  const r = loan.interestRate / 100 / 12;

  // Group payments by YYYY-MM
  const byMonth: Record<string, number> = {};
  for (const p of sorted) {
    const ym = p.date.slice(0, 7);
    byMonth[ym] = (byMonth[ym] ?? 0) + p.amount;
  }

  let balance = loan.principal;
  // Walk from whichever is earlier: startDate or first payment date
  const firstPaymentYM = sorted[0].date.slice(0, 7);
  const startYM        = loan.startDate.slice(0, 7);
  const walkFromYM     = startYM < firstPaymentYM ? startYM : firstPaymentYM;
  let [sy, sm] = walkFromYM.split("-").map(Number);
  const lastYM = sorted[sorted.length - 1].date.slice(0, 7);
  const [ey, em] = lastYM.split("-").map(Number);

  while (sy < ey || (sy === ey && sm <= em)) {
    const ym = `${sy}-${String(sm).padStart(2, "0")}`;
    balance += balance * r;
    balance -= byMonth[ym] ?? 0;
    balance = Math.max(0, balance);
    sm++; if (sm > 12) { sm = 1; sy++; }
  }
  return balance;
}

/**
 * Remaining months to pay off using CURRENT balance + CURRENT payment plan.
 * Changing the payment updates this projection without touching history.
 */
export function calcRemainingMonths(loan: Loan, payments: LoanPayment[]): number {
  const balance = calcActualBalance(loan, payments);
  if (balance <= 0) return 0;
  const r = loan.interestRate / 100 / 12;
  const outflow = monthlyOutflow(loan);
  if (outflow <= 0) return Infinity;
  if (r === 0) return Math.ceil(balance / outflow);
  if (outflow <= balance * r) return Infinity;
  return Math.ceil(-Math.log(1 - (balance * r) / outflow) / Math.log(1 + r));
}

export function calcPayoffDate(loan: Loan, payments: LoanPayment[]): Date | null {
  const months = calcRemainingMonths(loan, payments);
  if (!isFinite(months)) return null;
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** All metrics using actual-balance model */
export function calcLoanMetrics(loan: Loan, payments: LoanPayment[]) {
  const currentBalance   = calcActualBalance(loan, payments);
  const totalPaid        = payments.reduce((s, p) => s + p.amount, 0);
  const principalPaid    = Math.max(0, loan.principal - currentBalance);
  const interestPaidSoFar= Math.max(0, totalPaid - principalPaid);
  const remainingMonths  = calcRemainingMonths(loan, payments);
  const payoffDate       = calcPayoffDate(loan, payments);
  const pctPaid          = loan.principal > 0
    ? Math.min(100, (principalPaid / loan.principal) * 100) : 0;

  return { totalPaid, currentBalance, interestPaidSoFar, pctPaid, remainingMonths, payoffDate };
}

/**
 * Build the chart curve.
 * Historical portion: actual running balance (immutable, based on logged payments).
 * Future portion: projected balance using CURRENT payment plan from today's balance.
 */
export function buildLoanCurve(loan: Loan, payments: LoanPayment[]) {
  const r = loan.interestRate / 100 / 12;
  const sorted = [...payments].sort((a, b) => a.date.localeCompare(b.date));
  const points: { label: string; balance: number; actual: boolean }[] = [];

  if (sorted.length === 0) {
    points.push({ label: "Start", balance: loan.principal, actual: false });
  } else {
    const byMonth: Record<string, number> = {};
    for (const p of sorted) {
      const ym = p.date.slice(0, 7);
      byMonth[ym] = (byMonth[ym] ?? 0) + p.amount;
    }
    let balance = loan.principal;
    points.push({ label: "Start", balance: parseFloat(balance.toFixed(2)), actual: true });
    const firstPaymentYM = sorted[0].date.slice(0, 7);
    const startYM        = loan.startDate.slice(0, 7);
    const walkFromYM     = startYM < firstPaymentYM ? startYM : firstPaymentYM;
    let [sy, sm] = walkFromYM.split("-").map(Number);
    const lastYM = sorted[sorted.length - 1].date.slice(0, 7);
    const [ey, em] = lastYM.split("-").map(Number);
    while (sy < ey || (sy === ey && sm <= em)) {
      const ym = `${sy}-${String(sm).padStart(2, "0")}`;
      balance += balance * r;
      balance -= byMonth[ym] ?? 0;
      balance = Math.max(0, balance);
      points.push({ label: ym, balance: parseFloat(balance.toFixed(2)), actual: true });
      sm++; if (sm > 12) { sm = 1; sy++; }
    }
  }

  // Future projection from current balance using current payment plan
  const outflow = monthlyOutflow(loan);
  let balance = points[points.length - 1].balance;
  if (balance > 0 && outflow > balance * r) {
    const maxM = Math.min(calcRemainingMonths(loan, payments) + 1, 360);
    for (let m = 1; m <= maxM; m++) {
      balance += balance * r;
      balance -= outflow;
      balance = Math.max(0, balance);
      points.push({ label: `+${m}mo`, balance: parseFloat(balance.toFixed(2)), actual: false });
      if (balance === 0) break;
    }
  }

  return points;
}

// ── useLoans hook ──────────────────────────────────────────────────────────

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const { reloadKey } = useBudgetSettingsCtx();
  const reload = () => setLoans(load<Loan[]>(LOANS_KEY, []));
  useEffect(() => { reload(); }, [reloadKey]); // eslint-disable-line
  useEffect(() => {
    const h = () => reload();
    window.addEventListener("bt_reload", h);
    return () => window.removeEventListener("bt_reload", h);
  }, []); // eslint-disable-line

  const addLoan = (data: Omit<Loan, "id" | "createdAt">): Loan => {
    const loan: Loan = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setLoans((prev) => { const next = [loan, ...prev]; save(LOANS_KEY, next); return next; });
    return loan;
  };
  const updateLoan = (id: string, data: Partial<Omit<Loan, "id" | "createdAt">>) => {
    setLoans((prev) => {
      const next = prev.map((l) => l.id === id ? { ...l, ...data } : l);
      save(LOANS_KEY, next); return next;
    });
  };
  const deleteLoan = (id: string) => {
    setLoans((prev) => { const next = prev.filter((l) => l.id !== id); save(LOANS_KEY, next); return next; });
    try { localStorage.removeItem(paymentsKey(id)); } catch { /**/ }
  };
  const sorted = [...loans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { loans: sorted, addLoan, updateLoan, deleteLoan };
}

// ── useLoanPayments hook ───────────────────────────────────────────────────

export function useLoanPayments(loanId: string) {
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  useEffect(() => { setPayments(load<LoanPayment[]>(paymentsKey(loanId), [])); }, [loanId]);

  const addPayment = (date: string, amount: number, note?: string) => {
    const p: LoanPayment = { id: crypto.randomUUID(), date, amount, note };
    setPayments((prev) => {
      const next = [...prev, p].sort((a, b) => a.date.localeCompare(b.date));
      save(paymentsKey(loanId), next); return next;
    });
  };
  const deletePayment = (id: string) => {
    setPayments((prev) => { const next = prev.filter((p) => p.id !== id); save(paymentsKey(loanId), next); return next; });
  };
  return { payments, addPayment, deletePayment };
}
