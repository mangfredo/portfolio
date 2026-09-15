"use client";

import { createContext, useContext } from "react";
import type { BtTheme } from "@/hooks/useBudgetSettings";

interface BudgetSettingsCtx {
  theme: BtTheme;
  demoMode: boolean;
  setTheme: (t: BtTheme) => void;
  setDemoMode: (v: boolean) => void;
  /** Increment to signal all store hooks to re-read from localStorage. */
  reloadKey: number;
}

export const BudgetSettingsContext = createContext<BudgetSettingsCtx>({
  theme: "light",
  demoMode: true,
  setTheme: () => {},
  setDemoMode: () => {},
  reloadKey: 0,
});

export function useBudgetSettingsCtx() {
  return useContext(BudgetSettingsContext);
}
