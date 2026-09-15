import type { Period, Expense } from "@/hooks/useBudgetStore";
import type { Loan } from "@/hooks/useLoanStore";
import type { SavingsGoal } from "@/hooks/useSavingsStore";
import type { ActiveTab } from "@/components/budget/Sidebar";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Pay period sample data ─────────────────────────────────────────────────

function buildSamplePeriods(): { periods: Period[]; expenses: Record<string, Expense[]> } {
  const now  = new Date();
  const yr   = now.getFullYear();
  const mo   = now.getMonth();
  const name = MONTHS[mo];

  const midId  = `demo-${yr}-${mo + 1}-mid`;
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
    [endId]: [
      { id: `${endId}-e1`, name: "Rent",        amount: 10000 },
      { id: `${endId}-e2`, name: "Groceries",   amount: 4200  },
      { id: `${endId}-e3`, name: "Electricity", amount: 1800  },
      { id: `${endId}-e4`, name: "Internet",    amount: 999   },
      { id: `${endId}-e5`, name: "Transport",   amount: 1500  },
      { id: `${endId}-e6`, name: "Dining Out",  amount: 2151  },
    ],
    [midId]: [
      { id: `${midId}-e1`, name: "Rent",        amount: 10000 },
      { id: `${midId}-e2`, name: "Groceries",   amount: 4800  },
      { id: `${midId}-e3`, name: "Electricity", amount: 2500  },
      { id: `${midId}-e4`, name: "Emergency",   amount: 3500  },
      { id: `${midId}-e5`, name: "Transport",   amount: 1500  },
      { id: `${midId}-e6`, name: "Dining Out",  amount: 1150  },
    ],
  };

  return { periods, expenses };
}

// ── Loan sample data ───────────────────────────────────────────────────────

const SAMPLE_LOANS: Loan[] = [
  {
    id: "demo-loan-car",
    name: "Car Loan",
    principal: 350000,
    interestRate: 10.5,
    monthlyPayment: 7500,
    paymentFrequency: "monthly" as const,
    startDate: "2024-01-01",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "demo-loan-personal",
    name: "Personal Loan",
    principal: 80000,
    interestRate: 18,
    monthlyPayment: 3200,
    paymentFrequency: "monthly" as const,
    startDate: "2025-06-01",
    createdAt: "2025-06-01T00:00:00.000Z",
  },
];

// ── Savings goal sample data ───────────────────────────────────────────────

function buildSampleSavings(): SavingsGoal[] {
  const now     = new Date();
  const yr      = now.getFullYear();
  const vacDate = `${yr + 1}-03-01`;
  const efDate  = `${yr + 1}-12-31`;

  return [
    {
      id: "demo-savings-emergency",
      name: "Emergency Fund",
      targetAmount: 150000,
      currentAmount: 45000,
      targetDate: efDate,
      monthlyContribution: 8750,
      createdAt: new Date(yr, 0, 1).toISOString(),
    },
    {
      id: "demo-savings-vacation",
      name: "Vacation Fund",
      targetAmount: 50000,
      currentAmount: 12500,
      targetDate: vacDate,
      monthlyContribution: 5000,
      createdAt: new Date(yr, 3, 1).toISOString(),
    },
  ];
}

// ── Load / clear ───────────────────────────────────────────────────────────

/** Load sample data for a specific tab only (merges, never overwrites by ID). */
export function loadSampleDataForTab(tab: ActiveTab) {
  if (tab === "pay-periods") {
    const { periods, expenses } = buildSamplePeriods();
    const existing: Period[] = JSON.parse(localStorage.getItem("bt_periods") ?? "[]");
    const existingIds = new Set(existing.map((p) => p.id));
    const toAdd = periods.filter((p) => !existingIds.has(p.id));
    localStorage.setItem("bt_periods", JSON.stringify([...existing, ...toAdd]));
    for (const p of toAdd) {
      const exp = expenses[p.id];
      if (exp) localStorage.setItem(`bt_items_${p.id}`, JSON.stringify(exp));
    }
  } else if (tab === "loans") {
    const existing: Loan[] = JSON.parse(localStorage.getItem("bt_loans") ?? "[]");
    const existingIds = new Set(existing.map((l) => l.id));
    const toAdd = SAMPLE_LOANS.filter((l) => !existingIds.has(l.id));
    localStorage.setItem("bt_loans", JSON.stringify([...existing, ...toAdd]));
  } else if (tab === "savings") {
    const sampleSavings = buildSampleSavings();
    const existing: SavingsGoal[] = JSON.parse(localStorage.getItem("bt_savings") ?? "[]");
    const existingIds = new Set(existing.map((g) => g.id));
    const toAdd = sampleSavings.filter((g) => !existingIds.has(g.id));
    localStorage.setItem("bt_savings", JSON.stringify([...existing, ...toAdd]));
  }
  window.dispatchEvent(new Event("bt_reload"));
}

/** Clear all data for a specific tab, including cascaded sub-records. */
export function clearTabData(tab: ActiveTab) {
  const allKeys = Object.keys(localStorage);
  if (tab === "pay-periods") {
    localStorage.removeItem("bt_periods");
    allKeys.filter((k) => k.startsWith("bt_items_")).forEach((k) => localStorage.removeItem(k));
  } else if (tab === "loans") {
    localStorage.removeItem("bt_loans");
    allKeys.filter((k) => k.startsWith("bt_loan_payments_")).forEach((k) => localStorage.removeItem(k));
  } else if (tab === "savings") {
    localStorage.removeItem("bt_savings");
    allKeys.filter((k) => k.startsWith("bt_savings_deposits_")).forEach((k) => localStorage.removeItem(k));
  }
  window.dispatchEvent(new Event("bt_reload"));
}

/** Returns true if the given tab has at least one entry in localStorage. */
export function hasTabData(tab: ActiveTab): boolean {
  if (tab === "pay-periods") {
    const periods: Period[] = JSON.parse(localStorage.getItem("bt_periods") ?? "[]");
    return periods.length > 0;
  } else if (tab === "loans") {
    const loans: Loan[] = JSON.parse(localStorage.getItem("bt_loans") ?? "[]");
    return loans.length > 0;
  } else {
    const savings: SavingsGoal[] = JSON.parse(localStorage.getItem("bt_savings") ?? "[]");
    return savings.length > 0;
  }
}

/** @deprecated Use loadSampleDataForTab instead. Loads all three tabs. */
export function loadSampleData() {
  loadSampleDataForTab("pay-periods");
  loadSampleDataForTab("loans");
  loadSampleDataForTab("savings");
}

/** @deprecated Use clearTabData instead. Clears all three tabs. */
export function clearAllData() {
  clearTabData("pay-periods");
  clearTabData("loans");
  clearTabData("savings");
}
