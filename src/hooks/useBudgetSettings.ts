"use client";

import { useEffect, useState } from "react";

export type BtTheme = "light" | "dark";

interface BudgetSettings {
  theme: BtTheme;
  demoMode: boolean;
  setTheme: (t: BtTheme) => void;
  setDemoMode: (v: boolean) => void;
}

const THEME_KEY = "bt_theme";
const DEMO_KEY  = "bt_demo";

export function useBudgetSettings(): BudgetSettings {
  const [theme, setThemeState]   = useState<BtTheme>("light");
  const [demoMode, setDemoState] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as BtTheme | null;
    if (saved === "dark" || saved === "light") setThemeState(saved);

    const demo = localStorage.getItem(DEMO_KEY);
    if (demo !== null) setDemoState(demo !== "false");
  }, []);

  const setTheme = (t: BtTheme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setDemoMode = (v: boolean) => {
    setDemoState(v);
    localStorage.setItem(DEMO_KEY, String(v));
  };

  return { theme, demoMode, setTheme, setDemoMode };
}
