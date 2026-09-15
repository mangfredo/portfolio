"use client";

import { useRef } from "react";
import { exportData, importData } from "@/lib/budgetBackup";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import { CURRENCIES } from "@/hooks/useBudgetSettings";
import type { ToastType } from "@/hooks/useToast";

export type ActiveTab = "pay-periods" | "loans" | "savings";

interface SidebarProps {
  activeTab: ActiveTab;
  hasData: boolean;
  onBack: () => void;
  onPayPeriods: () => void;
  onLoans: () => void;
  onSavings: () => void;
  onReset: () => void;
  onClear: () => void;
  onToast: (msg: string, type?: ToastType) => void;
}

export default function Sidebar({
  activeTab,
  hasData,
  onBack, onPayPeriods, onLoans, onSavings,
  onReset, onClear, onToast,
}: SidebarProps) {
  const { theme, setTheme, demoMode, setDemoMode, currency, setCurrency } = useBudgetSettingsCtx();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === "light";

  const tabLabel = activeTab === "pay-periods" ? "Pay Period"
    : activeTab === "loans" ? "Loan"
    : "Savings";

  const sLabel  = isLight ? "#1E293B" : "#7CA4D4";
  const sText   = isLight ? "#0F172A" : "#94A3B8";
  const sHead   = isLight ? "#0F172A" : "#E2E8F0";
  const sDivide = isLight ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.07)";
  const sSelect = isLight
    ? { background: "rgba(0,0,0,0.12)", color: "#0F172A", border: "1px solid rgba(0,0,0,0.15)" }
    : { background: "#1E293B", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.15)" };
  const sToggle = isLight
    ? { background: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.12)", color: "#0F172A" }
    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#CBD5E1" };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      onToast("Data imported successfully", "success");
      setTimeout(() => { window.location.href = "/budget-tracker"; }, 600);
    } catch {
      onToast("Import failed — invalid backup file", "error");
    }
    e.target.value = "";
  };

  const handleExport = () => {
    exportData();
    onToast("Backup exported", "success");
  };

  const navItem = (tab: ActiveTab, icon: string, label: string, onClick: () => void) => (
    <button
      className={`bt-nav-item${activeTab === tab ? " active" : ""}`}
      onClick={onClick}
    >
      <span className="text-sm w-4 text-center opacity-70">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="bt-sidebar flex flex-col h-full py-6 px-4 overflow-y-auto">
      {/* Brand */}
      <div className="mb-8 px-2">
        <p className="text-[0.6rem] uppercase tracking-[0.18em] mb-1" style={{ color: sLabel }}>
          Portfolio App
        </p>
        <h1 className="text-base font-bold tracking-tight" style={{ color: sHead }}>
          Budget Engine
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItem("pay-periods", "◈", "Pay Periods",    onPayPeriods)}
        {navItem("loans",       "⊕", "Loan Repayment", onLoans)}
        {navItem("savings",     "◎", "Savings Goal",   onSavings)}
      </nav>

      {/* ── Settings ──────────────────────────────────────────────────── */}
      <div className="mt-4 pt-4" style={{ borderTop: sDivide }}>
        <p className="text-[0.6rem] uppercase tracking-widest px-2 mb-3" style={{ color: sLabel }}>
          Settings
        </p>

        {/* Appearance */}
        <div className="px-2 mb-3">
          <p className="text-[0.65rem] uppercase tracking-wider mb-1.5" style={{ color: sText }}>
            Appearance
          </p>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "light" | "dark")}
            className="w-full rounded-md px-3 py-2 text-xs font-medium outline-none"
            style={{ ...sSelect, cursor: "pointer" }}
          >
            <option value="light" style={{ background: sSelect.background, color: sSelect.color }}>☀ Light</option>
            <option value="dark"  style={{ background: sSelect.background, color: sSelect.color }}>☾ Dark</option>
          </select>
        </div>

        {/* Currency */}
        <div className="px-2 mb-3">
          <p className="text-[0.65rem] uppercase tracking-wider mb-1.5" style={{ color: sText }}>
            Currency
          </p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-xs font-medium outline-none"
            style={{ ...sSelect, cursor: "pointer" }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: sSelect.background, color: sSelect.color }}>
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Demo mode toggle */}
        <div className="px-2 mb-1">
          <p className="text-[0.65rem] uppercase tracking-wider mb-1.5" style={{ color: sText }}>
            Demo Mode
          </p>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium"
            style={sToggle}
          >
            <span>{demoMode ? "On" : "Off"}</span>
            <span
              className="w-7 h-4 rounded-full flex items-center px-0.5 transition-colors"
              style={{ background: demoMode ? "#0D9488" : "#334155" }}
            >
              <span
                className="w-3 h-3 rounded-full bg-white transition-transform"
                style={{ transform: demoMode ? "translateX(12px)" : "translateX(0)" }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ── Backup ───────────────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: sDivide }}>
        <p className="text-[0.6rem] uppercase tracking-widest px-2 mb-2" style={{ color: sLabel }}>
          Backup
        </p>
        <button onClick={handleExport} className="bt-nav-item text-xs w-full" style={{ color: sText }}>
          <span className="text-sm opacity-60">↓</span>
          Export Data
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="bt-nav-item text-xs w-full" style={{ color: sText }}>
          <span className="text-sm opacity-60">↑</span>
          Import Data
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
      </div>

      {/* ── Demo controls ────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: sDivide }}>
        {demoMode && (
          <>
            <p className="text-[0.6rem] uppercase tracking-widest px-2 mb-2" style={{ color: sLabel }}>
              Demo
            </p>
            <button onClick={onReset} className="bt-nav-item text-xs w-full" style={{ color: sText }}>
              <span className="text-sm opacity-60">↺</span>
              Load {tabLabel} Sample Data
            </button>
          </>
        )}
        <button
          onClick={onClear}
          disabled={!hasData}
          className="bt-nav-item text-xs w-full"
          style={{
            color: hasData ? sText : (isLight ? "rgba(15,23,42,0.3)" : "rgba(148,163,184,0.35)"),
            cursor: hasData ? "pointer" : "not-allowed",
            opacity: hasData ? 1 : 0.5,
          }}
        >
          <span className="text-sm opacity-60">✕</span>
          Clear {tabLabel} Data
        </button>
      </div>

      {/* ── Back to portfolio ──────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: sDivide }}>
        <button onClick={onBack} className="bt-nav-item text-xs w-full" style={{ color: sText }}>
          <span className="text-sm opacity-60">←</span>
          Back to Portfolio
        </button>
      </div>
    </aside>
  );
}
