"use client";

import { useRef, useState } from "react";
import {
  ChartBar, CreditCard, PiggyBank,
  Sun, Moon, ArrowCounterClockwise, X, Export, Upload, ArrowLeft,
  List,
} from "@phosphor-icons/react";
import { exportData, importData } from "@/lib/budgetBackup";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import { CURRENCIES } from "@/hooks/useBudgetSettings";
import type { ActiveTab } from "./Sidebar";
import type { ToastType } from "@/hooks/useToast";

interface TopNavProps {
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

const TABS: { id: ActiveTab; label: string; Icon: React.ElementType }[] = [
  { id: "pay-periods", label: "Pay Periods", Icon: ChartBar },
  { id: "loans",       label: "Loans",       Icon: CreditCard },
  { id: "savings",     label: "Savings",     Icon: PiggyBank },
];

export default function TopNav({
  activeTab, hasData,
  onBack, onPayPeriods, onLoans, onSavings,
  onReset, onClear, onToast,
}: TopNavProps) {
  const { theme, setTheme, currency, setCurrency } = useBudgetSettingsCtx();
  const isDark = theme === "dark";
  const fileRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mobileCurrencyOpen, setMobileCurrencyOpen] = useState(false);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  const tabLabel = activeTab === "pay-periods" ? "Pay Period"
    : activeTab === "loans" ? "Loan" : "Savings";

  const handlers: Record<ActiveTab, () => void> = {
    "pay-periods": onPayPeriods,
    loans: onLoans,
    savings: onSavings,
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      onToast("Data imported", "success");
      setTimeout(() => { window.location.href = "/budget-tracker"; }, 500);
    } catch {
      onToast("Import failed — invalid file", "error");
    }
    e.target.value = "";
  };

  return (
    <>
      {/* ── Desktop/tablet: floating dock row + utility bar ─────────────── */}
      <header className="wf-desktop-header sticky top-0 z-40">

        {/* Row 1: Floating dock — centered pill with logo + tabs */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 24px 8px" }}>
          <nav className="wf-dock flex items-center gap-1 px-2 py-1.5">
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 12px", marginRight:8 }}>
              <img
                src="/budget-tracker-logo-arrow.svg"
                alt="LaanFlow"
                width={24}
                height={24}
                style={{ borderRadius: 6, display:"block", flexShrink:0 }}
              />
              <span style={{ fontWeight:700, fontSize:"0.875rem", color:"var(--wf-text)", letterSpacing:"-0.01em" }}>
                LaanFlow
              </span>
            </div>

            <div style={{ width:1, height:16, background:"rgba(255,255,255,0.10)", flexShrink:0 }} />

            {/* Tabs */}
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={handlers[id]}
                className={`wf-tab ${activeTab === id ? "active" : ""}`}
              >
                <Icon size={14} weight={activeTab === id ? "fill" : "regular"} />
                {label}
                {activeTab === id && (
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--wf-cyan)", flexShrink:0 }} />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Row 2: Utility bar */}
        <div className="wf-utility-bar" style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"6px 24px", gap:12,
        }}>
          <button onClick={onBack} style={{
            display:"flex", alignItems:"center", gap:6, fontSize:"0.75rem",
            fontWeight:500, color:"var(--wf-muted)", background:"none", border:"none", cursor:"pointer",
            flexShrink:0,
          }}>
            <ArrowLeft size={13} /> Portfolio
          </button>

          <div style={{ flex:1 }} />

          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            {/* Custom currency picker */}
            <div style={{ position:"relative" }}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                style={{
                  display:"flex", alignItems:"center", gap:4,
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
                  borderRadius:8, padding:"4px 8px", cursor:"pointer",
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  fontSize:"0.75rem", fontWeight:600, fontFamily:"var(--font-outfit,system-ui)",
                }}
              >
                <span>{selectedCurrency.symbol}</span>
                <span>{selectedCurrency.code}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity:0.5 }}>
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {currencyOpen && (
                <>
                  <div onClick={() => setCurrencyOpen(false)} style={{ position:"fixed", inset:0, zIndex:200 }}/>
                  <div style={{
                    position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:201,
                    background: isDark ? "#1E293B" : "#E4E8E9",
                    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
                    borderRadius:10, overflow:"hidden",
                    boxShadow: isDark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.15)",
                    minWidth:160, maxHeight:280, overflowY:"auto",
                  }}>
                    {CURRENCIES.map(c => (
                      <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                        style={{
                          display:"flex", alignItems:"center", gap:8,
                          width:"100%", padding:"8px 12px", textAlign:"left",
                          background: c.code === currency
                            ? "var(--wf-cyan-dim)"
                            : "transparent",
                          color: c.code === currency
                            ? "var(--wf-cyan)"
                            : isDark ? "#F1F5F9" : "#121A2C",
                          fontSize:"0.8rem", fontWeight: c.code === currency ? 700 : 400,
                          fontFamily:"var(--font-outfit,system-ui)", cursor:"pointer",
                          borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
                        }}>
                        <span style={{ width:20, flexShrink:0 }}>{c.symbol}</span>
                        <span>{c.code}</span>
                        <span style={{ color: isDark ? "#64748B" : "#64748B", fontSize:"0.7rem", marginLeft:"auto" }}>{c.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className="wf-icon-btn" title="Toggle theme">
              {isDark ? <Sun size={14}/> : <Moon size={14}/>}
            </button>

            {/* Load sample data — always accessible */}
            <button onClick={onReset} className="wf-icon-btn" title={`Load ${tabLabel} sample data`}>
              <ArrowCounterClockwise size={14}/>
            </button>
            <button onClick={onClear} disabled={!hasData} className="wf-icon-btn danger"
              title={`Clear ${tabLabel} data`}
              style={{ opacity:hasData?1:0.35, cursor:hasData?"pointer":"not-allowed" }}>
              <X size={14}/>
            </button>
            <button onClick={() => { exportData(); onToast("Backup exported","success"); }}
              className="wf-icon-btn" title="Export data">
              <Export size={14}/>
            </button>
            <button onClick={() => fileRef.current?.click()} className="wf-icon-btn" title="Import data">
              <Upload size={14}/>
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" style={{ display:"none" }} onChange={handleImport}/>
          </div>
        </div>
      </header>

      {/* ── Mobile: slim top bar — logo only, everything else in hamburger ── */}
      <header className="wf-mobile-topbar sticky top-0 z-40" style={{
        background:"rgba(15,23,42,0.90)",
        backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"10px 16px",
        alignItems:"center",
        justifyContent:"space-between",
        gap:8,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <img
            src="/budget-tracker-logo-arrow.svg"
            alt="LaanFlow"
            width={22}
            height={22}
            style={{ borderRadius: 6, display:"block", flexShrink:0 }}
          />
          <span style={{ fontWeight:700, fontSize:"0.8125rem", color:"var(--wf-text)" }}>LaanFlow</span>
        </div>

      </header>

      {/* ── Mobile: bottom tab dock (fixed, iOS-style) ───────────────────── */}
      <nav className="wf-bottom-dock" style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:"rgba(15,23,42,0.92)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(255,255,255,0.10)",
        alignItems:"center", justifyContent:"space-around",
        padding:"8px 0 max(8px, env(safe-area-inset-bottom))",
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={handlers[id]} style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"4px 20px", background:"none", border:"none", cursor:"pointer",
              flex:1,
            }}>
              <div style={{
                width:40, height:28, borderRadius:14, display:"flex",
                alignItems:"center", justifyContent:"center",
                background: isActive ? "var(--wf-cyan-dim)" : "transparent",
                transition:"background 200ms ease",
              }}>
                <Icon size={20} color={isActive ? "var(--wf-cyan)" : "#64748B"} weight={isActive ? "fill" : "regular"}/>
              </div>
              <span style={{
                fontSize:"0.625rem", fontWeight:600,
                color: isActive ? "var(--wf-cyan)" : "#64748B",
                letterSpacing:"0.02em",
              }}>{label}</span>
            </button>
          );
        })}

        {/* Hamburger — opens menu sheet */}
        <button onClick={() => setMenuOpen(true)} style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          gap:3, padding:"4px 20px", background:"none", border:"none", cursor:"pointer",
          flex:1,
        }}>
          <div style={{
            width:40, height:28, borderRadius:14, display:"flex",
            alignItems:"center", justifyContent:"center",
            background: menuOpen ? "var(--wf-cyan-dim)" : "transparent",
            transition:"background 200ms ease",
          }}>
            <List size={20} color={menuOpen ? "var(--wf-cyan)" : "#64748B"} weight="regular"/>
          </div>
          <span style={{ fontSize:"0.625rem", fontWeight:600, color: menuOpen ? "var(--wf-cyan)" : "#64748B" }}>More</span>
        </button>
      </nav>

      {/* ── Mobile: slide-up menu sheet ──────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => { setMenuOpen(false); setMobileCurrencyOpen(false); }} style={{
            position:"fixed", inset:0, zIndex:60,
            background:"rgba(0,0,0,0.5)",
            backdropFilter:"blur(4px)",
          }}/>

          {/* Sheet */}
          <div style={{
            position:"fixed", bottom:0, left:0, right:0, zIndex:61,
            background: isDark ? "#0F172A" : "#FFFFFF",
            borderTop: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
            borderRadius:"20px 20px 0 0",
            padding:"20px 20px calc(20px + env(safe-area-inset-bottom))",
            animation:"wf-slide-up 260ms cubic-bezier(0.32,0.72,0,1)",
            color: isDark ? "#F1F5F9" : "#0F172A",
          }}>
            {/* Handle bar */}
            <div style={{ width:40, height:4, borderRadius:99, background:"rgba(255,255,255,0.18)", margin:"0 auto 20px" }}/>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <span style={{ fontWeight:700, fontSize:"1rem", color: isDark ? "#F1F5F9" : "#0F172A" }}>Settings</span>
              <button onClick={() => { setMenuOpen(false); setMobileCurrencyOpen(false); }} className="wf-icon-btn">
                <X size={14}/>
              </button>
            </div>

            {/* Currency */}
            <div style={{ marginBottom:16, position:"relative" }}>
              <p style={{ fontSize:"0.7rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color: isDark ? "#94A3B8" : "#64748B", marginBottom:8 }}>Currency</p>
              {/* Trigger button */}
              <button
                onClick={() => setMobileCurrencyOpen(!mobileCurrencyOpen)}
                style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 14px", borderRadius:10, cursor:"pointer",
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  fontFamily:"var(--font-outfit,system-ui)", fontSize:"0.875rem",
                }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"1.1rem" }}>{selectedCurrency.symbol}</span>
                  <span style={{ fontWeight:600 }}>{selectedCurrency.code}</span>
                  <span style={{ color: isDark ? "#64748B" : "#94A3B8", fontSize:"0.8rem" }}>{selectedCurrency.name}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ transform: mobileCurrencyOpen ? "rotate(180deg)" : "rotate(0)", transition:"transform 200ms ease", flexShrink:0 }}>
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown list */}
              {mobileCurrencyOpen && (
                <div style={{
                  position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:10,
                  background: isDark ? "#1E293B" : "#FFFFFF",
                  border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
                  borderRadius:10, overflow:"hidden", maxHeight:220, overflowY:"auto",
                  boxShadow: isDark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.15)",
                }}>
                  {CURRENCIES.map((c, i) => (
                    <button key={c.code}
                      onClick={() => { setCurrency(c.code); setMobileCurrencyOpen(false); }}
                      style={{
                        display:"flex", alignItems:"center", gap:12,
                        width:"100%", padding:"10px 14px", textAlign:"left",
                        background: c.code === currency
                          ? "var(--wf-cyan-dim)"
                          : (isDark ? "transparent" : i % 2 === 0 ? "#FFFFFF" : "rgba(0,0,0,0.02)"),
                        borderBottom: i < CURRENCIES.length - 1
                          ? (isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)")
                          : "none",
                        color: c.code === currency ? "var(--wf-cyan)" : (isDark ? "#F1F5F9" : "#0F172A"),
                        fontFamily:"var(--font-outfit,system-ui)", cursor:"pointer",
                      }}>
                      <span style={{ fontSize:"1rem", width:24, textAlign:"center", flexShrink:0 }}>{c.symbol}</span>
                      <span style={{ fontWeight: c.code === currency ? 700 : 500, fontSize:"0.875rem" }}>{c.code}</span>
                      <span style={{ fontSize:"0.75rem", color: isDark ? "#64748B" : "#94A3B8", marginLeft:"auto" }}>{c.name}</span>
                      {c.code === currency && <span style={{ color:"var(--wf-cyan)", flexShrink:0 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.7rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color: isDark ? "#94A3B8" : "#64748B", marginBottom:8 }}>Appearance</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {(["dark","light"] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", borderRadius:10, border:"1px solid", fontWeight:600, fontSize:"0.875rem", cursor:"pointer", transition:"all 150ms ease",
                      background: theme === t ? "var(--wf-cyan-dim)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                      borderColor: theme === t ? "rgba(56,189,248,0.40)" : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"),
                      color: theme === t ? "var(--wf-cyan)" : (isDark ? "#94A3B8" : "#64748B"),
                    }}>
                    {t === "dark" ? <Moon size={15}/> : <Sun size={15}/>}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Load sample + clear data */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              <button onClick={() => { onReset(); setMenuOpen(false); }}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 0", borderRadius:10, background:"rgba(34,211,238,0.10)", border:"1px solid rgba(56,189,248,0.20)", color:"var(--wf-cyan)", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
                <ArrowCounterClockwise size={14}/> Load Sample
              </button>
              <button onClick={() => { onClear(); setMenuOpen(false); }} disabled={!hasData}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 0", borderRadius:10, background:"rgba(244,63,94,0.10)", border:"1px solid rgba(244,63,94,0.20)", color:"var(--wf-pink)", fontWeight:600, fontSize:"0.8rem", cursor: hasData ? "pointer" : "not-allowed", opacity: hasData ? 1 : 0.4 }}>
                <X size={14}/> Clear Data
              </button>
            </div>

            {/* Data actions */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              <button onClick={() => { exportData(); onToast("Backup exported","success"); setMenuOpen(false); }}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 0", borderRadius:10, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", color: isDark ? "#94A3B8" : "#64748B", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
                <Export size={14}/> Export
              </button>
              <button onClick={() => { fileRef.current?.click(); }}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 0", borderRadius:10, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", color: isDark ? "#94A3B8" : "#64748B", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
                <Upload size={14}/> Import
              </button>
            </div>

            {/* Back to portfolio */}
            <button onClick={() => { setMenuOpen(false); onBack(); }}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", borderRadius:10, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: isDark ? "#94A3B8" : "#64748B", fontWeight:600, fontSize:"0.875rem", cursor:"pointer" }}>
              <ArrowLeft size={15}/> Back to Portfolio
            </button>
          </div>

          <style>{`@keyframes wf-slide-up { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
        </>
      )}
    </>
  );
}
