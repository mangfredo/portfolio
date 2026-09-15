"use client";

import { createContext, useContext } from "react";
import type { BtTheme } from "@/hooks/useBudgetSettings";

export interface BudgetSettingsCtx {
  theme: BtTheme;
  demoMode: boolean;
  currency: string;
  currencySymbol: string;
  setTheme: (t: BtTheme) => void;
  setDemoMode: (v: boolean) => void;
  setCurrency: (code: string) => void;
  /** Increment to signal all store hooks to re-read from localStorage. */
  reloadKey: number;
}

export const BudgetSettingsContext = createContext<BudgetSettingsCtx>({
  theme: "light",
  demoMode: true,
  currency: "PHP",
  currencySymbol: "₱",
  setTheme: () => {},
  setDemoMode: () => {},
  setCurrency: () => {},
  reloadKey: 0,
});

export function useBudgetSettingsCtx() {
  return useContext(BudgetSettingsContext);
}
