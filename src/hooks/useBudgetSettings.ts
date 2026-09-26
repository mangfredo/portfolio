"use client";

import { useEffect, useState } from "react";

export type BtTheme = "light" | "dark";

// Server-side (and initial client render) defaults — must match so hydration passes.
const SSR_CURRENCY = "PHP";
const SSR_SYMBOL   = "₱";

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "PHP", symbol: "₱",  name: "Philippine Peso" },
  { code: "USD", symbol: "$",  name: "US Dollar" },
  { code: "EUR", symbol: "€",  name: "Euro" },
  { code: "GBP", symbol: "£",  name: "British Pound" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen" },
  { code: "CNY", symbol: "¥",  name: "Chinese Yuan" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "HKD", symbol: "HK$",name: "Hong Kong Dollar" },
  { code: "AED", symbol: "د.إ",name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼",  name: "Saudi Riyal" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee" },
  { code: "KRW", symbol: "₩",  name: "South Korean Won" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "THB", symbol: "฿",  name: "Thai Baht" },
  { code: "VND", symbol: "₫",  name: "Vietnamese Dong" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "Mex$",name: "Mexican Peso" },
];

import type { ViewMode } from "@/context/BudgetSettingsContext";

interface BudgetSettings {
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
  bumpReload: () => void;
}

const THEME_KEY    = "bt_theme";
const DEMO_KEY     = "bt_demo";
const CURRENCY_KEY = "bt_currency";
const VIEW_KEY     = "bt_view_mode";

const DEFAULT_CURRENCY = CURRENCIES[0]; // PHP

export function useBudgetSettings(): BudgetSettings {
  const [theme, setThemeState] = useState<BtTheme>("light");
  const [demoMode, setDemoState] = useState<boolean>(true);
  // Start with SSR-safe defaults so server HTML matches initial client render.
  // After mount, read localStorage and update if different.
  const [currency, setCurrencyState] = useState<string>(SSR_CURRENCY);
  const [viewMode, setViewModeState] = useState<ViewMode>("cutoff");
  const [reloadKey, setReloadKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Derive symbol from currency — always in sync, no stale state.
  // Before mount, return the SSR default to avoid hydration mismatch.
  const currencySymbol = mounted
    ? (CURRENCIES.find((c) => c.code === currency)?.symbol ?? DEFAULT_CURRENCY.symbol)
    : SSR_SYMBOL;

  // On mount: read localStorage for all settings, then mark mounted.
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") setThemeState(savedTheme);

    const savedDemo = localStorage.getItem(DEMO_KEY);
    if (savedDemo !== null) setDemoState(savedDemo !== "false");

    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    if (savedCurrency && CURRENCIES.find((c) => c.code === savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else {
      // IP auto-detect only if no currency saved yet
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((data) => {
          const ipCode = data?.currency as string | undefined;
          if (!ipCode) return;
          const match = CURRENCIES.find((c) => c.code === ipCode);
          if (match) {
            setCurrencyState(match.code);
            localStorage.setItem(CURRENCY_KEY, match.code);
          }
        })
        .catch(() => { /* fall back to PHP */ });
    }

    const savedView = localStorage.getItem(VIEW_KEY);
    if (savedView === "flexible" || savedView === "cutoff") setViewModeState(savedView);

    setMounted(true);
  }, []);

  const setTheme = (t: BtTheme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setDemoMode = (v: boolean) => {
    setDemoState(v);
    localStorage.setItem(DEMO_KEY, String(v));
  };

  const setCurrency = (code: string) => {
    const match = CURRENCIES.find((c) => c.code === code);
    if (!match) return;
    setCurrencyState(match.code);
    localStorage.setItem(CURRENCY_KEY, match.code);
  };

  const setViewMode = (v: ViewMode) => {
    setViewModeState(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const bumpReload = () => setReloadKey((k) => k + 1);

  return {
    theme, demoMode, currency, currencySymbol, viewMode,
    setTheme, setDemoMode, setCurrency, setViewMode,
    reloadKey, bumpReload,
  };
}
