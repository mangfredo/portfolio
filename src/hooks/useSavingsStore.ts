"use client";

import { useEffect, useState } from "react";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";

// ── Data types ─────────────────────────────────────────────────────────────

export interface SavingsGoal {
  id: string;
  name: string;
  icon?: string;               // icon key from GOAL_ICONS
  targetAmount: number;
  currentAmount: number;       // starting / manual balance
  targetDate?: string;         // ISO date string (optional)
  monthlyContribution?: number; // planned monthly deposit (optional)
  createdAt: string;
}

export interface SavingsDeposit {
  id: string;
  date: string;   // ISO date string
  amount: number;
  note?: string;
}

// ── localStorage keys ──────────────────────────────────────────────────────

const SAVINGS_KEY   = "bt_savings";
const depositsKey   = (goalId: string) => `bt_savings_deposits_${goalId}`;

// ── Utility load/save ──────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ── Savings projection calculations ───────────────────────────────────────

export type GoalStatus = "achieved" | "on-track" | "behind" | "no-date";

/**
 * Total saved = initial amount + all deposits.
 */
export function calcTotalSaved(goal: SavingsGoal, deposits: SavingsDeposit[]): number {
  return goal.currentAmount + deposits.reduce((s, d) => s + d.amount, 0);
}

/**
 * Project the completion date based on monthly contribution.
 * Returns null if no contribution is set or the goal is already met.
 */
export function calcProjectedDate(
  goal: SavingsGoal,
  deposits: SavingsDeposit[],
): Date | null {
  const saved    = calcTotalSaved(goal, deposits);
  const remaining = goal.targetAmount - saved;
  if (remaining <= 0) return null; // already achieved
  const monthly  = goal.monthlyContribution ?? 0;
  if (monthly <= 0) return null;
  const months   = Math.ceil(remaining / monthly);
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Monthly amount needed to hit the target by the target date.
 * Returns null if no target date or already achieved.
 */
export function calcMonthlyNeeded(
  goal: SavingsGoal,
  deposits: SavingsDeposit[],
): number | null {
  if (!goal.targetDate) return null;
  const saved     = calcTotalSaved(goal, deposits);
  const remaining = goal.targetAmount - saved;
  if (remaining <= 0) return 0;
  const now    = new Date();
  const target = new Date(goal.targetDate);
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  if (months <= 0) return remaining; // already past or this month
  return remaining / months;
}

/**
 * Status badge logic.
 */
export function calcGoalStatus(
  goal: SavingsGoal,
  deposits: SavingsDeposit[],
): GoalStatus {
  const saved = calcTotalSaved(goal, deposits);
  if (saved >= goal.targetAmount) return "achieved";
  if (!goal.targetDate) return "no-date";

  const needed    = calcMonthlyNeeded(goal, deposits) ?? 0;
  const monthly   = goal.monthlyContribution ?? 0;
  const tolerance = 0.05; // 5% buffer

  if (monthly >= needed * (1 - tolerance)) return "on-track";
  return "behind";
}

/**
 * All derived metrics for a savings goal.
 */
export function calcSavingsMetrics(goal: SavingsGoal, deposits: SavingsDeposit[]) {
  const totalSaved     = calcTotalSaved(goal, deposits);
  const remaining      = Math.max(0, goal.targetAmount - totalSaved);
  const pctComplete    = goal.targetAmount > 0
    ? Math.min(100, (totalSaved / goal.targetAmount) * 100) : 0;
  const projectedDate  = calcProjectedDate(goal, deposits);
  const monthlyNeeded  = calcMonthlyNeeded(goal, deposits);
  const status         = calcGoalStatus(goal, deposits);

  return {
    totalSaved, remaining, pctComplete, projectedDate, monthlyNeeded, status,
    depositCount: deposits.length,
  };
}

// ── useSavings hook ────────────────────────────────────────────────────────

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const { reloadKey } = useBudgetSettingsCtx();

  const reload = () => setGoals(load<SavingsGoal[]>(SAVINGS_KEY, []));

  useEffect(() => { reload(); }, [reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addGoal = (data: Omit<SavingsGoal, "id" | "createdAt">): SavingsGoal => {
    const goal: SavingsGoal = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setGoals((prev) => {
      const next = [goal, ...prev];
      save(SAVINGS_KEY, next);
      return next;
    });
    return goal;
  };

  const updateGoal = (id: string, data: Partial<Omit<SavingsGoal, "id" | "createdAt">>) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, ...data } : g));
      save(SAVINGS_KEY, next);
      return next;
    });
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      save(SAVINGS_KEY, next);
      return next;
    });
    try { localStorage.removeItem(depositsKey(id)); } catch { /* ignore */ }
  };

  const sorted = [...goals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return { goals: sorted, addGoal, updateGoal, deleteGoal };
}

// ── useSavingsDeposits hook ────────────────────────────────────────────────

export function useSavingsDeposits(goalId: string) {
  const [deposits, setDeposits] = useState<SavingsDeposit[]>([]);

  useEffect(() => {
    setDeposits(load<SavingsDeposit[]>(depositsKey(goalId), []));
  }, [goalId]);

  const addDeposit = (date: string, amount: number, note?: string) => {
    const deposit: SavingsDeposit = { id: crypto.randomUUID(), date, amount, note };
    setDeposits((prev) => {
      const next = [...prev, deposit].sort((a, b) => a.date.localeCompare(b.date));
      save(depositsKey(goalId), next);
      return next;
    });
  };

  const deleteDeposit = (id: string) => {
    setDeposits((prev) => {
      const next = prev.filter((d) => d.id !== id);
      save(depositsKey(goalId), next);
      return next;
    });
  };

  return { deposits, addDeposit, deleteDeposit };
}
