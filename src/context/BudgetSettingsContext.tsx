"use client";

import { createContext, useContext } from "react";
import type { BtTheme } from "@/hooks/useBudgetSettings";

interface BudgetSettingsCtx {
  theme: BtTheme;
  demoMode: boolean;
  setTheme: (t: BtTheme) => void;
  setDemoMode: (v: boolean) => void;
}

export const BudgetSettingsContext = createContext<BudgetSettingsCtx>({
  theme: "light",
  demoMode: true,
  setTheme: () => {},
  setDemoMode: () => {},
});

export function useBudgetSettingsCtx() {
  return useContext(BudgetSettingsContext);
}
