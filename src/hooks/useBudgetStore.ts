"use client";

import { useEffect, useState } from "react";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";

export interface Period {
  id: string;
  label: string;
  budget: number;
  createdAt: string;
  // Flexible View fields — all optional for backwards compatibility
  monthKey?: string;        // "YYYY-MM" e.g. "2026-11"
  section1Label?: string;   // default "Avg spending"
  bufferLabel?: string;     // default "Buffer"
  sortOrder?: number;       // manual sort order for Flexible View drag-and-drop
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  paid?: boolean;
  sectionKey?: "s1" | "buffer"; // default "s1" — backwards compatible
}

// ── Gig (side income stream) ───────────────────────────────────────────────

export interface Gig {
  id: string;
  label: string;       // e.g. "Editing side gig"
  income: number;      // expected income amount
  monthKey?: string;   // "YYYY-MM" — used for grouping in FlexibleView
  createdAt: string;
}

export interface GigItem {
  id: string;
  name: string;
  amount: number;
  paid?: boolean;
}

const PERIODS_KEY = "bt_periods";
const GIGS_KEY = "bt_gigs";
const itemsKey = (id: string) => `bt_items_${id}`;
const gigItemsKey = (id: string) => `bt_gig_items_${id}`;

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
  const { reloadKey } = useBudgetSettingsCtx();

  const reload = () => setPeriods(load<Period[]>(PERIODS_KEY, []));

  // Initial load on mount
  useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reload();
  }, [reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadPeriods = () => reload();

  const addPeriod = (label: string, monthKey?: string): Period => {
    const period: Period = {
      id: crypto.randomUUID(),
      label,
      budget: 0,
      createdAt: new Date().toISOString(),
      monthKey,
    };
    setPeriods((prev) => {
      const next = [period, ...prev];
      save(PERIODS_KEY, next);  // save happens inside updater — runs sync before dispatch
      return next;
    });
    // Use setTimeout so the updater has flushed before other instances reload
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
    return period;
  };

  const updateBudget = (id: string, budget: number) => {
    setPeriods((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, budget } : p));
      save(PERIODS_KEY, next);
      return next;
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
  };

  const updatePeriodMeta = (id: string, patch: Partial<Pick<Period, "label" | "monthKey" | "section1Label" | "bufferLabel">>) => {
    setPeriods((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      save(PERIODS_KEY, next);
      return next;
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
  };

  /** Persist a manual drag-and-drop order by writing sortOrder to each period. */
  const reorderPeriods = (orderedIds: string[]) => {
    setPeriods((prev) => {
      const next = prev.map((p) => {
        const idx = orderedIds.indexOf(p.id);
        return idx >= 0 ? { ...p, sortOrder: idx } : p;
      });
      save(PERIODS_KEY, next);
      return next;
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
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
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
  };

  // Sort: if any period has sortOrder, use it; otherwise fall back to createdAt desc
  const hasSortOrder = periods.some(p => p.sortOrder !== undefined);
  const sorted = [...periods].sort((a, b) => {
    if (hasSortOrder) {
      const ao = a.sortOrder ?? 999999;
      const bo = b.sortOrder ?? 999999;
      if (ao !== bo) return ao - bo;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return { periods: sorted, addPeriod, updateBudget, updatePeriodMeta, reorderPeriods, deletePeriod, reloadPeriods };
}

// ── Expenses ───────────────────────────────────────────────────────────────

export function useExpenses(periodId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(load<Expense[]>(itemsKey(periodId), []));
  }, [periodId]);

  // Also listen for bt_reload
  useEffect(() => {
    const handler = () => setExpenses(load<Expense[]>(itemsKey(periodId), []));
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, [periodId]);

  const addExpense = (name: string, amount: number, sectionKey: "s1" | "buffer" = "s1") => {
    const expense: Expense = {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount,
      sectionKey,
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

  const togglePaid = (id: string) => {
    setExpenses((prev) => {
      const next = prev.map((e) =>
        e.id === id ? { ...e, paid: !e.paid } : e
      );
      save(itemsKey(periodId), next);
      return next;
    });
  };

  // All expenses — for Per Cut-off view (unchanged)
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Section-aware helpers for Flexible View
  const s1Expenses = expenses.filter(e => (e.sectionKey ?? "s1") === "s1");
  const bufferExpenses = expenses.filter(e => e.sectionKey === "buffer");
  const s1Total = s1Expenses.reduce((sum, e) => sum + e.amount, 0);
  const bufferAllocated = bufferExpenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, addExpense, updateExpense, deleteExpense, togglePaid, total, s1Expenses, bufferExpenses, s1Total, bufferAllocated };
}

// ── Gigs ───────────────────────────────────────────────────────────────────

export function useGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const { reloadKey } = useBudgetSettingsCtx();

  const reload = () => setGigs(load<Gig[]>(GIGS_KEY, []));

  // Initial load on mount
  useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { reload(); }, [reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addGig = (label: string, income: number, monthKey?: string): Gig => {
    const gig: Gig = {
      id: crypto.randomUUID(),
      label,
      income,
      monthKey,
      createdAt: new Date().toISOString(),
    };
    setGigs((prev) => {
      const next = [gig, ...prev];
      save(GIGS_KEY, next);
      return next;
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
    return gig;
  };

  const updateGig = (id: string, patch: Partial<Pick<Gig, "label" | "income" | "monthKey">>) => {
    setGigs((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, ...patch } : g));
      save(GIGS_KEY, next);
      return next;
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
  };

  const deleteGig = (id: string) => {
    setGigs((prev) => {
      const next = prev.filter((g) => g.id !== id);
      save(GIGS_KEY, next);
      return next;
    });
    try { localStorage.removeItem(gigItemsKey(id)); } catch { /* ignore */ }
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
  };

  // Sort newest first
  const sorted = [...gigs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { gigs: sorted, addGig, updateGig, deleteGig };
}

// ── Gig Items ──────────────────────────────────────────────────────────────

export function useGigItems(gigId: string) {
  const [items, setItems] = useState<GigItem[]>([]);

  useEffect(() => {
    setItems(load<GigItem[]>(gigItemsKey(gigId), []));
  }, [gigId]);

  useEffect(() => {
    const handler = () => setItems(load<GigItem[]>(gigItemsKey(gigId), []));
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, [gigId]);

  const addItem = (name: string, amount: number) => {
    const item: GigItem = { id: crypto.randomUUID(), name: name.trim(), amount };
    setItems((prev) => {
      const next = [...prev, item];
      save(gigItemsKey(gigId), next);
      return next;
    });
  };

  const updateItem = (id: string, name: string, amount: number) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, name: name.trim(), amount } : i));
      save(gigItemsKey(gigId), next);
      return next;
    });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(gigItemsKey(gigId), next);
      return next;
    });
  };

  const togglePaid = (id: string) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, paid: !i.paid } : i));
      save(gigItemsKey(gigId), next);
      return next;
    });
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return { items, addItem, updateItem, deleteItem, togglePaid, total };
}
