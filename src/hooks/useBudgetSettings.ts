"use client";

import { useEffect, useState } from "react";

export type BtTheme = "light" | "dark";

interface BudgetSettings {
  theme: BtTheme;
  demoMode: boolean;
  setTheme: (t: BtTheme) => void;
  setDemoMode: (v: boolean) => void;
  reloadKey: number;
  bumpReload: () => void;
}

const THEME_KEY = "bt_theme";
const DEMO_KEY  = "bt_demo";

export function useBudgetSettings(): BudgetSettings {
  const [theme, setThemeState]   = useState<BtTheme>("light");
  const [demoMode, setDemoState] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState(0);

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

  const bumpReload = () => setReloadKey((k) => k + 1);

  return { theme, demoMode, setTheme, setDemoMode, reloadKey, bumpReload };
}
