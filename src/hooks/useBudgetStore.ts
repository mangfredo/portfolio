"use client";

import { useEffect, useState } from "react";

export interface Period {
  id: string;
  label: string;
  budget: number;
  createdAt: string; // ISO string
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
}

const PERIODS_KEY = "bt_periods";
const itemsKey = (id: string) => `bt_items_${id}`;

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silent
  }
}

// ── Periods ────────────────────────────────────────────────────────────────

export function usePeriods() {
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    setPeriods(load<Period[]>(PERIODS_KEY, []));
  }, []);

  const addPeriod = (label: string): Period => {
    const period: Period = {
      id: crypto.randomUUID(),
      label,
      budget: 0,
      createdAt: new Date().toISOString(),
    };
    setPeriods((prev) => {
      const next = [period, ...prev];
      save(PERIODS_KEY, next);
      return next;
    });
    return period;
  };

  const updateBudget = (id: string, budget: number) => {
    setPeriods((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, budget } : p));
      save(PERIODS_KEY, next);
      return next;
    });
  };

  const deletePeriod = (id: string) => {
    setPeriods((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(PERIODS_KEY, next);
      return next;
    });
    try {
      localStorage.removeItem(itemsKey(id));
    } catch {
      // ignore
    }
  };

  // Sort chronologically — newest first
  const sorted = [...periods].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { periods: sorted, addPeriod, updateBudget, deletePeriod };
}

// ── Expenses ───────────────────────────────────────────────────────────────

export function useExpenses(periodId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(load<Expense[]>(itemsKey(periodId), []));
  }, [periodId]);

  const addExpense = (name: string, amount: number) => {
    const expense: Expense = {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount,
    };
    setExpenses((prev) => {
      const next = [...prev, expense];
      save(itemsKey(periodId), next);
      return next;
    });
  };

  const updateExpense = (id: string, name: string, amount: number) => {
    setExpenses((prev) => {
      const next = prev.map((e) =>
        e.id === id ? { ...e, name: name.trim(), amount } : e
      );
      save(itemsKey(periodId), next);
      return next;
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(itemsKey(periodId), next);
      return next;
    });
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, addExpense, updateExpense, deleteExpense, total };
}
