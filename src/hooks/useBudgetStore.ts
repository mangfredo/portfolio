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
  sortOrder?: number; // manual sort order for drag-and-drop
}

// ── Gig (side income stream) ───────────────────────────────────────────────

export interface Gig {
  id: string;
  label: string;       // e.g. "Editing side gig"
  income: number;      // expected income amount
  monthKey?: string;   // "YYYY-MM" — used for grouping in FlexibleView
  createdAt: string;
  sortOrder?: number;  // manual sort order for drag-and-drop
}

export interface GigItem {
  id: string;
  name: string;
  amount: number;
  paid?: boolean;
  sortOrder?: number; // manual sort order for drag-and-drop
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
  // Start empty for SSR hydration, then load from localStorage after mount
  const [periods, setPeriods] = useState<Period[]>([]);
  const [mounted, setMounted] = useState(false);
  const { reloadKey } = useBudgetSettingsCtx();

  const reload = () => setPeriods(load<Period[]>(PERIODS_KEY, []));

  // Initial load on mount — also sets mounted flag
  useEffect(() => { reload(); setMounted(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return { periods: sorted, addPeriod, updateBudget, updatePeriodMeta, reorderPeriods, deletePeriod, reloadPeriods, mounted };
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

  /** Reorder expenses by setting sortOrder based on provided id array */
  const reorderExpenses = (orderedIds: string[]) => {
    setExpenses((prev) => {
      const next = prev.map((e) => {
        const idx = orderedIds.indexOf(e.id);
        return idx >= 0 ? { ...e, sortOrder: idx } : e;
      });
      save(itemsKey(periodId), next);
      return next;
    });
  };

  // All expenses — for Per Cut-off view (unchanged)
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Sort helper — respects sortOrder if present
  const sortByOrder = (items: Expense[]) => {
    const hasSortOrder = items.some(e => e.sortOrder !== undefined);
    if (!hasSortOrder) return items;
    return [...items].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999));
  };

  // Section-aware helpers for Flexible View
  const s1Expenses = sortByOrder(expenses.filter(e => (e.sectionKey ?? "s1") === "s1"));
  const bufferExpenses = sortByOrder(expenses.filter(e => e.sectionKey === "buffer"));
  const s1Total = s1Expenses.reduce((sum, e) => sum + e.amount, 0);
  const bufferAllocated = bufferExpenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, addExpense, updateExpense, deleteExpense, togglePaid, reorderExpenses, total, s1Expenses, bufferExpenses, s1Total, bufferAllocated };
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

  /** Reorder gigs by setting sortOrder based on provided id array */
  const reorderGigs = (orderedIds: string[]) => {
    setGigs((prev) => {
      const next = prev.map((g) => {
        const idx = orderedIds.indexOf(g.id);
        return idx >= 0 ? { ...g, sortOrder: idx } : g;
      });
      save(GIGS_KEY, next);
      return next;
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
    }, 0);
  };

  // Sort: if any gig has sortOrder, use it; otherwise fall back to createdAt desc
  const hasSortOrder = gigs.some(g => g.sortOrder !== undefined);
  const sorted = [...gigs].sort((a, b) => {
    if (hasSortOrder) {
      const ao = a.sortOrder ?? 999999;
      const bo = b.sortOrder ?? 999999;
      if (ao !== bo) return ao - bo;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return { gigs: sorted, addGig, updateGig, deleteGig, reorderGigs };
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

  /** Reorder gig items by setting sortOrder based on provided id array */
  const reorderItems = (orderedIds: string[]) => {
    setItems((prev) => {
      const next = prev.map((i) => {
        const idx = orderedIds.indexOf(i.id);
        return idx >= 0 ? { ...i, sortOrder: idx } : i;
      });
      save(gigItemsKey(gigId), next);
      return next;
    });
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  // Sort: if any item has sortOrder, use it; otherwise keep original order
  const hasSortOrder = items.some(i => i.sortOrder !== undefined);
  const sortedItems = hasSortOrder
    ? [...items].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999))
    : items;

  return { items: sortedItems, addItem, updateItem, deleteItem, togglePaid, reorderItems, total };
}

// ── Copy Utilities ─────────────────────────────────────────────────────────

/**
 * Copy all periods, gigs, and their items from a source month to a target month.
 * Merges with existing data (does not replace).
 */
export function copyMonthBudget(sourceMonthKey: string, targetMonthKey: string): void {
  // Load all periods and filter by source month
  const allPeriods = load<Period[]>(PERIODS_KEY, []);
  const sourcePeriods = allPeriods.filter(p => p.monthKey === sourceMonthKey);
  
  if (sourcePeriods.length === 0) {
    console.warn(`copyMonthBudget: No periods found for month ${sourceMonthKey}`);
    return;
  }

  const newPeriods: Period[] = [];
  const expenseMappings: Array<{ sourceId: string; newId: string }> = [];

  // Create new periods for target month
  for (const src of sourcePeriods) {
    // Adjust label: replace source month with target month in the label
    // e.g., "October 15" -> "November 15" if copying Oct to Nov
    const [srcYear, srcMonth] = sourceMonthKey.split("-").map(Number);
    const [tgtYear, tgtMonth] = targetMonthKey.split("-").map(Number);
    const srcMonthName = new Date(srcYear, srcMonth - 1).toLocaleString("default", { month: "long" });
    const tgtMonthName = new Date(tgtYear, tgtMonth - 1).toLocaleString("default", { month: "long" });
    
    let newLabel = src.label;
    if (src.label.includes(srcMonthName)) {
      newLabel = src.label.replace(srcMonthName, tgtMonthName);
    } else {
      // If label doesn't contain month name, prefix with target month
      newLabel = `${tgtMonthName} ${src.label}`;
    }

    const newPeriod: Period = {
      id: crypto.randomUUID(),
      label: newLabel,
      budget: src.budget,
      createdAt: new Date().toISOString(),
      monthKey: targetMonthKey,
      section1Label: src.section1Label,
      bufferLabel: src.bufferLabel,
      sortOrder: src.sortOrder,
    };
    
    newPeriods.push(newPeriod);
    expenseMappings.push({ sourceId: src.id, newId: newPeriod.id });
  }

  // Save new periods (merge with existing)
  const updatedPeriods = [...allPeriods, ...newPeriods];
  save(PERIODS_KEY, updatedPeriods);

  // Copy expenses for each period
  for (const mapping of expenseMappings) {
    const sourceExpenses = load<Expense[]>(itemsKey(mapping.sourceId), []);
    const newExpenses: Expense[] = sourceExpenses.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      paid: false, // Reset paid status for copied expenses
    }));
    save(itemsKey(mapping.newId), newExpenses);
  }

  // Load all gigs and filter by source month
  const allGigs = load<Gig[]>(GIGS_KEY, []);
  const sourceGigs = allGigs.filter(g => g.monthKey === sourceMonthKey);
  
  const newGigs: Gig[] = [];
  const gigMappings: Array<{ sourceId: string; newId: string }> = [];

  // Create new gigs for target month
  for (const src of sourceGigs) {
    const newGig: Gig = {
      id: crypto.randomUUID(),
      label: src.label,
      income: src.income,
      monthKey: targetMonthKey,
      createdAt: new Date().toISOString(),
      sortOrder: src.sortOrder,
    };
    
    newGigs.push(newGig);
    gigMappings.push({ sourceId: src.id, newId: newGig.id });
  }

  // Save new gigs (merge with existing)
  if (newGigs.length > 0) {
    const updatedGigs = [...allGigs, ...newGigs];
    save(GIGS_KEY, updatedGigs);

    // Copy gig items for each gig
    for (const mapping of gigMappings) {
      const sourceItems = load<GigItem[]>(gigItemsKey(mapping.sourceId), []);
      const newItems: GigItem[] = sourceItems.map(i => ({
        ...i,
        id: crypto.randomUUID(),
        paid: false, // Reset paid status for copied items
      }));
      save(gigItemsKey(mapping.newId), newItems);
    }
  }

  // Dispatch reload event for UI sync
  setTimeout(() => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
  }, 0);
}


/**
 * Copy a single period's budget and expenses to specified dates across months.
 * Each target creates a new period with the specified monthKey and day.
 */
export function copyPeriodBudget(
  sourcePeriodId: string,
  targets: Array<{ monthKey: string; day: number }>
): void {
  // Load source period
  const allPeriods = load<Period[]>(PERIODS_KEY, []);
  const sourcePeriod = allPeriods.find(p => p.id === sourcePeriodId);
  
  if (!sourcePeriod) {
    console.warn(`copyPeriodBudget: Period ${sourcePeriodId} not found`);
    return;
  }

  if (targets.length === 0) {
    console.warn("copyPeriodBudget: No targets specified");
    return;
  }

  // Load source period's expenses
  const sourceExpenses = load<Expense[]>(itemsKey(sourcePeriodId), []);

  const newPeriods: Period[] = [];
  const expenseMappings: Array<{ newId: string }> = [];

  // Create new period for each target
  for (const target of targets) {
    const [year, month] = target.monthKey.split("-").map(Number);
    const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
    
    // Create label like "November 15" or "December 30"
    const newLabel = `${monthName} ${target.day}`;

    const newPeriod: Period = {
      id: crypto.randomUUID(),
      label: newLabel,
      budget: sourcePeriod.budget,
      createdAt: new Date().toISOString(),
      monthKey: target.monthKey,
      section1Label: sourcePeriod.section1Label,
      bufferLabel: sourcePeriod.bufferLabel,
      // Don't copy sortOrder — let new periods sort naturally
    };
    
    newPeriods.push(newPeriod);
    expenseMappings.push({ newId: newPeriod.id });
  }

  // Save new periods (merge with existing)
  const updatedPeriods = [...allPeriods, ...newPeriods];
  save(PERIODS_KEY, updatedPeriods);

  // Copy expenses to each new period
  for (const mapping of expenseMappings) {
    const newExpenses: Expense[] = sourceExpenses.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      paid: false, // Reset paid status for copied expenses
    }));
    save(itemsKey(mapping.newId), newExpenses);
  }

  // Dispatch reload event for UI sync
  setTimeout(() => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("bt_reload"));
  }, 0);
}
