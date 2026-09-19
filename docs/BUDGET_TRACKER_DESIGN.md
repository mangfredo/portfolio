# Budget Tracker — Complete Design Document

A personal finance management system built as a portfolio project. Tracks pay period budgets, loan repayments, and savings goals with real-time calculations, beautiful visualizations, and offline-first localStorage persistence.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Feature Modules](#feature-modules)
5. [State Management](#state-management)
6. [UI Components](#ui-components)
7. [Styling System](#styling-system)
8. [File Structure](#file-structure)
9. [localStorage Schema](#localstorage-schema)
10. [Calculation Logic](#calculation-logic)
11. [User Flows](#user-flows)

---

## Overview

### Purpose
Budget Tracker is a standalone finance app embedded within a portfolio site. It demonstrates:
- Complex state management with React hooks
- Real-time financial calculations
- Recharts data visualization
- Theme switching (light/dark)
- Currency localization (20 currencies)
- Offline-first architecture using localStorage

### Key Features
| Feature | Description |
|---------|-------------|
| **Pay Periods** | Track expenses against a budget for each pay period |
| **Loan Repayment** | Monitor loan payoff with interest calculations and projections |
| **Savings Goals** | Track progress toward financial targets with projected completion dates |
| **Multi-currency** | 20 currencies with auto-detection via IP geolocation |
| **Theme Toggle** | Light and dark modes with no flash on load |
| **Data Backup** | Export/import all data as JSON |
| **Demo Mode** | Load sample data per tab for demonstration |

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS variables + Tailwind utilities
- **Charts**: Recharts
- **Persistence**: localStorage (no backend)
- **State**: React hooks + Context API

### Component Hierarchy

```
BudgetShell (layout + context provider)
├── Sidebar
│   ├── Navigation (Pay Periods | Loans | Savings)
│   ├── Settings (Theme, Currency, Demo Mode)
│   └── Backup Controls (Export/Import/Clear)
│
├── BudgetHome (Pay Periods list)
│   └── PeriodDetail (single period view)
│       ├── Metric Cards (Budget, Spent, Remaining)
│       ├── Balance Waterfall Chart
│       ├── Expense Allocation Pie Chart
│       └── Expense Table
│
├── LoansHome (Loans list)
│   └── LoanDetail (single loan view)
│       ├── Metric Cards (Balance, Paid, Interest, Payoff Date)
│       ├── Balance Over Time Chart
│       └── Payment History Table
│
└── SavingsHome (Goals list)
    └── SavingsDetail (single goal view)
        ├── Metric Cards (Saved, Remaining, Projected, Monthly Needed)
        ├── Savings Growth Chart
        └── Deposit History Table
```

### Data Flow

```
localStorage
    ↓ (read on mount + bt_reload events)
Custom Hooks (usePeriods, useLoans, useSavings, etc.)
    ↓ (state + CRUD functions)
Page Components
    ↓ (via Context)
BudgetSettingsContext (theme, currency, demoMode)
    ↓
UI Rendering
```

---

## Data Models

### Pay Periods

```typescript
interface Period {
  id: string;           // UUID
  label: string;        // e.g. "September 15, 2026"
  budget: number;       // total budget for this period
  createdAt: string;    // ISO timestamp
}

interface Expense {
  id: string;           // UUID
  name: string;         // e.g. "Groceries"
  amount: number;       // expense amount
  paid?: boolean;       // mark as paid (visual strikethrough)
}
```

### Loans

```typescript
interface Loan {
  id: string;
  name: string;                    // e.g. "Car Loan"
  principal: number;               // original loan amount
  interestRate: number;            // annual % (e.g. 12 = 12%)
  monthlyPayment: number;          // scheduled payment per occurrence
  paymentFrequency: "monthly" | "twice-monthly";
  startDate: string;               // ISO date
  createdAt: string;
}

interface LoanPayment {
  id: string;
  date: string;                    // ISO date
  amount: number;
  note?: string;
}
```

### Savings Goals

```typescript
interface SavingsGoal {
  id: string;
  name: string;                    // e.g. "Emergency Fund"
  targetAmount: number;
  currentAmount: number;           // initial amount already saved
  targetDate?: string;             // optional deadline
  monthlyContribution?: number;    // planned monthly deposit
  createdAt: string;
}

interface SavingsDeposit {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

type GoalStatus = "achieved" | "on-track" | "behind" | "no-date";
```

### Settings

```typescript
interface BudgetSettings {
  theme: "light" | "dark";
  demoMode: boolean;
  currency: string;           // ISO code (e.g. "USD")
  currencySymbol: string;     // display symbol (e.g. "$")
}
```

---

## Feature Modules

### 1. Pay Periods (`/budget-tracker`)

**List View (`BudgetHome.tsx`)**
- Display all pay periods with budget status
- Create new periods via modal
- Empty state with call-to-action

**Detail View (`PeriodDetail.tsx`)**
- **Metric Cards**: Budget, Total Spent, Remaining
- **Balance Waterfall**: Area chart showing budget depletion
- **Expense Allocation**: Donut chart by category
- **Expense Table**: List/edit/delete expenses, mark as paid
- **Modals**: Set budget, add/edit expense

### 2. Loan Repayment (`/budget-tracker/loans`)

**List View (`LoansHome.tsx`)**
- Display all loans with progress bars
- Show % paid, payoff date projection, monthly payment
- Create new loans via modal

**Detail View (`LoanDetail.tsx`)**
- **Metric Cards**: Remaining Balance, Total Paid, Interest Paid, Payoff Date
- **Balance Chart**: Line chart showing actual vs projected payoff curve
- **Payment History**: Log payments, view/delete history
- **Edit Payment Plan**: Update monthly payment amount and frequency

### 3. Savings Goals (`/budget-tracker/savings`)

**List View (`SavingsHome.tsx`)**
- Display all goals with status badges
- Show progress bars, amounts, target dates
- Create new goals via modal

**Detail View (`SavingsDetail.tsx`)**
- **Metric Cards**: Total Saved, Remaining, Projected Completion, Monthly Needed
- **Growth Chart**: Area chart showing savings over time
- **Deposit History**: Log deposits, view/delete history

---

## State Management

### Context: `BudgetSettingsContext`

Provides global settings to all budget tracker components:

```typescript
interface BudgetSettingsCtx {
  theme: "light" | "dark";
  demoMode: boolean;
  currency: string;
  currencySymbol: string;
  setTheme: (t: "light" | "dark") => void;
  setDemoMode: (v: boolean) => void;
  setCurrency: (code: string) => void;
  reloadKey: number;  // signals stores to re-read localStorage
}
```

### Custom Hooks

| Hook | Purpose | localStorage Key(s) |
|------|---------|---------------------|
| `useBudgetSettings` | Theme, currency, demo mode | `bt_theme`, `bt_currency`, `bt_demo` |
| `usePeriods` | CRUD for pay periods | `bt_periods` |
| `useExpenses(periodId)` | CRUD for period expenses | `bt_items_{id}` |
| `useLoans` | CRUD for loans | `bt_loans` |
| `useLoanPayments(loanId)` | CRUD for loan payments | `bt_loan_payments_{id}` |
| `useSavings` | CRUD for savings goals | `bt_savings` |
| `useSavingsDeposits(goalId)` | CRUD for deposits | `bt_savings_deposits_{id}` |

### Event System

All hooks listen for `bt_reload` custom events to synchronize state after operations like "Load Sample Data" or "Import Data":

```javascript
window.dispatchEvent(new Event("bt_reload"));
```

---

## UI Components

### Shared Components (`/components/budget/`)

| Component | Description |
|-----------|-------------|
| `BudgetShell` | Main layout wrapper, provides context, handles modals |
| `Sidebar` | Navigation, settings controls, backup buttons |
| `Modal` | Generic modal with glassmorphism styling |
| `BudgetModal` | Loading overlay + confirm modal variants |
| `ToastContainer` | Toast notifications |
| `BudgetSplash` | Animated splash on first load |
| `NumericInput` | Text input with thousand-comma formatting |

### NumericInput Component

Custom input that displays values with thousand separators while maintaining raw numeric strings:

```typescript
// Input: "15000" → Displays: "15,000"
// onChange receives raw value without commas
<NumericInput
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="bt-input bt-data"
/>

// Helper for parsing
import { parseNumeric } from "@/components/budget/NumericInput";
const value = parseNumeric("15,000"); // → 15000
```

---

## Styling System

### CSS Architecture

All styles are scoped to `.bt-root` to avoid bleeding into the portfolio site:

```css
/* Light mode tokens */
.bt-root {
  --bt-bg: #F4F6F9;
  --bt-surface: #FFFFFF;
  --bt-text: #0F172A;
  --bt-teal: #0D9488;
  /* ... */
}

/* Dark mode tokens */
.bt-root[data-bt-theme="dark"] {
  --bt-bg: #090D16;
  --bt-surface: #1E293B;
  --bt-text: #F8FAFC;
  --bt-teal: #2DD4BF;
  /* ... */
}
```

### Theme Flash Prevention

An inline script in `layout.tsx` reads `bt_theme` from localStorage and sets `data-bt-theme` on `<html>` synchronously before React hydrates, eliminating the light→dark flash.

### Utility Classes

| Class | Purpose |
|-------|---------|
| `.bt-card` | Card container with hover effects |
| `.bt-input` | Form input styling |
| `.bt-btn-primary` | Teal gradient button |
| `.bt-btn-ghost` | Transparent outlined button |
| `.bt-text-main` | Primary text color |
| `.bt-text-muted` | Muted/secondary text |
| `.bt-text-teal` | Accent color text |
| `.bt-data` | Monospace tabular numbers |
| `.bt-badge` | Status badges |

---

## File Structure

```
portfolio/src/
├── app/budget-tracker/
│   ├── budget.css              # Scoped design system
│   ├── page.tsx                # Entry point → BudgetHome
│   ├── BudgetHome.tsx          # Pay periods list
│   ├── [id]/
│   │   ├── page.tsx            # Dynamic route
│   │   └── PeriodDetail.tsx    # Single period view
│   ├── loans/
│   │   ├── page.tsx            # → LoansHome
│   │   ├── LoansHome.tsx       # Loans list
│   │   └── [id]/
│   │       ├── page.tsx        # Dynamic route
│   │       └── LoanDetail.tsx  # Single loan view
│   └── savings/
│       ├── page.tsx            # → SavingsHome
│       ├── SavingsHome.tsx     # Goals list
│       └── [id]/
│           ├── page.tsx        # Dynamic route
│           └── SavingsDetail.tsx # Single goal view
│
├── components/budget/
│   ├── BudgetShell.tsx         # Layout + context provider
│   ├── Sidebar.tsx             # Navigation + settings
│   ├── Modal.tsx               # Generic modal
│   ├── BudgetModal.tsx         # Loading/confirm modals
│   ├── ToastContainer.tsx      # Toast notifications
│   ├── BudgetSplash.tsx        # Intro animation
│   └── NumericInput.tsx        # Formatted number input
│
├── context/
│   └── BudgetSettingsContext.tsx # Settings context
│
├── hooks/
│   ├── useBudgetSettings.ts    # Theme/currency/demo
│   ├── useBudgetStore.ts       # Periods & expenses
│   ├── useLoanStore.ts         # Loans & payments
│   ├── useSavingsStore.ts      # Goals & deposits
│   ├── useToast.ts             # Toast notifications
│   ├── useCountUp.ts           # Number animation
│   └── useSwipeToClose.ts      # Mobile gesture
│
└── lib/
    ├── budgetSampleData.ts     # Sample data generation
    └── budgetBackup.ts         # Export/import functions
```

---

## localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `bt_theme` | `"light"` \| `"dark"` | UI theme |
| `bt_currency` | `string` | ISO currency code |
| `bt_demo` | `"true"` \| `"false"` | Demo mode toggle |
| `bt_periods` | `Period[]` | All pay periods |
| `bt_items_{periodId}` | `Expense[]` | Expenses for a period |
| `bt_loans` | `Loan[]` | All loans |
| `bt_loan_payments_{loanId}` | `LoanPayment[]` | Payments for a loan |
| `bt_savings` | `SavingsGoal[]` | All savings goals |
| `bt_savings_deposits_{goalId}` | `SavingsDeposit[]` | Deposits for a goal |

### Sample Data IDs

Sample data uses deterministic IDs prefixed with `demo-`:
- Periods: `demo-{year}-{month}-mid`, `demo-{year}-{month}-end`
- Loans: `demo-loan-car`, `demo-loan-personal`
- Savings: `demo-savings-emergency`, `demo-savings-vacation`

---

## Calculation Logic

### Loan Calculations (`useLoanStore.ts`)

**Actual Balance** — Walks month-by-month from loan start, applying:
1. Interest accrual: `balance *= (1 + monthlyRate)`
2. Payment deduction: logged payments or scheduled payment

```typescript
function calcActualBalance(loan: Loan, payments: LoanPayment[]): number
```

**Payoff Projection** — Calculates remaining months using amortization formula:

```typescript
months = Math.ceil(
  Math.log(pmt / (pmt - balance * monthlyRate)) / 
  Math.log(1 + monthlyRate)
)
```

**Loan Metrics**:
- `currentBalance` — Current remaining balance
- `totalPaid` — Sum of all logged payments
- `pctPaid` — Percentage of principal paid off
- `payoffDate` — Projected payoff date
- `remainingMonths` — Months until payoff
- `interestPaidSoFar` — Estimated interest portion of payments

### Savings Calculations (`useSavingsStore.ts`)

**Total Saved** = `currentAmount + sum(deposits)`

**Projected Completion** — Based on monthly contribution:
```typescript
months = Math.ceil(remaining / monthlyContribution)
```

**Monthly Needed** — To hit target date:
```typescript
monthsRemaining = targetDate - today (in months)
monthlyNeeded = remaining / monthsRemaining
```

**Goal Status**:
- `achieved` — Total saved ≥ target
- `on-track` — Projected date ≤ target date
- `behind` — Projected date > target date
- `no-date` — No target date set

---

## User Flows

### 1. First Visit
1. App detects no saved currency → IP geolocation auto-detect
2. Demo mode enabled by default
3. Empty state shown with "Load Sample Data" option

### 2. Creating a Pay Period
1. Click "+ New Period" button
2. Enter label (e.g. "September 15")
3. Period created with $0 budget
4. Redirect to period detail
5. Click "Set budget" to enter amount
6. Add expenses via "+ Add Item"

### 3. Tracking a Loan
1. Navigate to Loan Repayment tab
2. Click "+ Add Loan"
3. Enter: name, principal, interest rate, payment amount, frequency, start date
4. Loan appears in list with calculated payoff projection
5. Click loan to view details
6. Log payments as they occur
7. Edit payment plan if terms change

### 4. Managing a Savings Goal
1. Navigate to Savings Goal tab
2. Click "+ Add Goal"
3. Enter: name, target amount, current amount, target date (optional), monthly contribution (optional)
4. Goal appears with status badge
5. Click goal to view details
6. Log deposits as you save
7. Track progress toward target

### 5. Changing Currency
1. Open Settings in sidebar
2. Select currency from dropdown
3. All amounts immediately display with new symbol
4. Note: Amounts are stored as raw numbers — no conversion occurs

### 6. Exporting Data
1. Click "Export Data" in sidebar
2. JSON file downloads with all data
3. File named `budget-backup-{date}.json`

### 7. Importing Data
1. Click "Import Data" in sidebar
2. Select backup JSON file
3. Data merged into localStorage
4. Page reloads to show imported data

### 8. Tab-Scoped Sample Data
1. Enable Demo Mode in settings
2. Navigate to desired tab (Pay Periods / Loans / Savings)
3. Click "Load {Tab} Sample Data"
4. Sample entries added only for that tab
5. Clear button removes only current tab's data

---

## Supported Currencies

| Code | Symbol | Name |
|------|--------|------|
| PHP | ₱ | Philippine Peso |
| USD | $ | US Dollar |
| EUR | € | Euro |
| GBP | £ | British Pound |
| JPY | ¥ | Japanese Yen |
| CNY | ¥ | Chinese Yuan |
| SGD | S$ | Singapore Dollar |
| AUD | A$ | Australian Dollar |
| CAD | C$ | Canadian Dollar |
| HKD | HK$ | Hong Kong Dollar |
| AED | د.إ | UAE Dirham |
| SAR | ﷼ | Saudi Riyal |
| INR | ₹ | Indian Rupee |
| KRW | ₩ | South Korean Won |
| IDR | Rp | Indonesian Rupiah |
| MYR | RM | Malaysian Ringgit |
| THB | ฿ | Thai Baht |
| VND | ₫ | Vietnamese Dong |
| BRL | R$ | Brazilian Real |
| MXN | Mex$ | Mexican Peso |

---

## Future Enhancements

- [ ] Currency conversion with real exchange rates
- [ ] Recurring expense templates
- [ ] Budget categories with color coding
- [ ] Multi-period comparison charts
- [ ] Cloud sync (optional backend)
- [ ] Mobile app (React Native)

---

*Document generated: September 2026*
*Budget Tracker v2.0*
