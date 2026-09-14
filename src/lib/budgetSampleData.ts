import type { Period, Expense } from "@/hooks/useBudgetStore";

export const SAMPLE_PERIODS: Period[] = [
  {
    id: "demo-sep-b",
    label: "September 30, 2026",
    budget: 32000,
    createdAt: "2026-09-16T00:00:00.000Z",
  },
  {
    id: "demo-sep-a",
    label: "September 15, 2026",
    budget: 32000,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "demo-aug-b",
    label: "August 30, 2026",
    budget: 30000,
    createdAt: "2026-08-16T00:00:00.000Z",
  },
  {
    id: "demo-aug-a",
    label: "August 15, 2026",
    budget: 30000,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
];

export const SAMPLE_EXPENSES: Record<string, Expense[]> = {
  "demo-sep-b": [
    { id: "e1", name: "Rent", amount: 10000 },
    { id: "e2", name: "Groceries", amount: 4200 },
    { id: "e3", name: "Electricity", amount: 1800 },
    { id: "e4", name: "Internet", amount: 999 },
    { id: "e5", name: "Transport", amount: 1500 },
    { id: "e6", name: "Dining Out", amount: 2100 },
  ],
  "demo-sep-a": [
    { id: "e7",  name: "Savings",    amount: 5000 },
    { id: "e8",  name: "Groceries",  amount: 3800 },
    { id: "e9",  name: "Clothing",   amount: 2500 },
    { id: "e10", name: "Health",     amount: 1200 },
    { id: "e11", name: "Transport",  amount: 1500 },
    { id: "e12", name: "Subscriptions", amount: 650 },
  ],
  "demo-aug-b": [
    { id: "e13", name: "Rent",       amount: 10000 },
    { id: "e14", name: "Groceries",  amount: 4500 },
    { id: "e15", name: "Electricity",amount: 2100 },
    { id: "e16", name: "Internet",   amount: 999  },
    { id: "e17", name: "Transport",  amount: 1600 },
  ],
  "demo-aug-a": [
    { id: "e18", name: "Savings",    amount: 4000 },
    { id: "e19", name: "Groceries",  amount: 3600 },
    { id: "e20", name: "Phone Bill", amount: 800  },
    { id: "e21", name: "Transport",  amount: 1500 },
  ],
};

export function loadSampleData() {
  localStorage.setItem("bt_periods", JSON.stringify(SAMPLE_PERIODS));
  for (const [id, expenses] of Object.entries(SAMPLE_EXPENSES)) {
    localStorage.setItem(`bt_items_${id}`, JSON.stringify(expenses));
  }
}

export function clearAllData() {
  const keys = Object.keys(localStorage).filter(
    (k) => k === "bt_periods" || k.startsWith("bt_items_")
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
