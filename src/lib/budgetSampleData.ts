import type { Period, Expense } from "@/hooks/useBudgetStore";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/** Build the 2 sample periods using the current calendar month/year. */
function buildSamplePeriods(): { periods: Period[]; expenses: Record<string, Expense[]> } {
  const now  = new Date();
  const yr   = now.getFullYear();
  const mo   = now.getMonth();        // 0-indexed
  const name = MONTHS[mo];

  // mid-month (15th) — normal, within budget
  const midId = `demo-${yr}-${mo + 1}-mid`;
  // end-of-month (last day) — over budget
  const endDay = new Date(yr, mo + 1, 0).getDate();
  const endId  = `demo-${yr}-${mo + 1}-end`;

  const periods: Period[] = [
    {
      id: endId,
      label: `${name} ${endDay}, ${yr}`,
      budget: 32000,
      createdAt: new Date(yr, mo, 16).toISOString(),
    },
    {
      id: midId,
      label: `${name} 15, ${yr}`,
      budget: 20000,
      createdAt: new Date(yr, mo, 1).toISOString(),
    },
  ];

  const expenses: Record<string, Expense[]> = {
    // End-of-month: normal — ₱20,650 spent vs ₱32,000 (64.5%)
    [endId]: [
      { id: `${endId}-e1`, name: "Rent",          amount: 10000 },
      { id: `${endId}-e2`, name: "Groceries",     amount: 4200  },
      { id: `${endId}-e3`, name: "Electricity",   amount: 1800  },
      { id: `${endId}-e4`, name: "Internet",      amount: 999   },
      { id: `${endId}-e5`, name: "Transport",     amount: 1500  },
      { id: `${endId}-e6`, name: "Dining Out",    amount: 2151  },
    ],
    // Mid-month: over budget — ₱23,450 spent vs ₱20,000 (117.25%)
    [midId]: [
      { id: `${midId}-e1`, name: "Rent",          amount: 10000 },
      { id: `${midId}-e2`, name: "Groceries",     amount: 4800  },
      { id: `${midId}-e3`, name: "Electricity",   amount: 2500  },
      { id: `${midId}-e4`, name: "Emergency",     amount: 3500  },
      { id: `${midId}-e5`, name: "Transport",     amount: 1500  },
      { id: `${midId}-e6`, name: "Dining Out",    amount: 1150  },
    ],
  };

  return { periods, expenses };
}

export function loadSampleData() {
  const { periods, expenses } = buildSamplePeriods();

  // Merge — don't overwrite user-added periods
  const existing: Period[] = JSON.parse(
    localStorage.getItem("bt_periods") ?? "[]"
  );
  const existingIds = new Set(existing.map((p) => p.id));
  const toAdd = periods.filter((p) => !existingIds.has(p.id));
  localStorage.setItem("bt_periods", JSON.stringify([...existing, ...toAdd]));

  for (const p of toAdd) {
    const exp = expenses[p.id];
    if (exp) localStorage.setItem(`bt_items_${p.id}`, JSON.stringify(exp));
  }

  // Signal all usePeriods hooks to re-read
  window.dispatchEvent(new Event("bt_reload"));
}

export function clearAllData() {
  const keys = Object.keys(localStorage).filter(
    (k) => k === "bt_periods" || k.startsWith("bt_items_")
  );
  keys.forEach((k) => localStorage.removeItem(k));

  // Signal all usePeriods hooks to re-read
  window.dispatchEvent(new Event("bt_reload"));
}
