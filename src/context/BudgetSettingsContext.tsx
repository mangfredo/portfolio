"use client";

import { createContext, useContext } from "react";
import type { BtTheme } from "@/hooks/useBudgetSettings";

export type ViewMode = "cutoff" | "flexible";

export interface BudgetSettingsCtx {
  theme: BtTheme;
  demoMode: boolean;
  currency: string;
  currencySymbol: string;
  viewMode: ViewMode;
  setTheme: (t: BtTheme) => void;
  setDemoMode: (v: boolean) => void;
  setCurrency: (code: string) => void;
  setViewMode: (v: ViewMode) => void;
  reloadKey: number;
}

export const BudgetSettingsContext = createContext<BudgetSettingsCtx>({
  theme: "light",
  demoMode: true,
  currency: "PHP",
  currencySymbol: "₱",
  viewMode: "cutoff",
  setTheme: () => {},
  setDemoMode: () => {},
  setCurrency: () => {},
  setViewMode: () => {},
  reloadKey: 0,
});

export function useBudgetSettingsCtx() {
  return useContext(BudgetSettingsContext);
}
