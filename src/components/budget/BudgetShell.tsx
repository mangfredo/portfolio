"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ToastContainer from "./ToastContainer";
import { LoadingOverlay, ConfirmModal } from "./BudgetModal";
import BudgetSplash from "./BudgetSplash";
import { loadSampleData, clearAllData } from "@/lib/budgetSampleData";
import { useBudgetSettings } from "@/hooks/useBudgetSettings";
import { BudgetSettingsContext } from "@/context/BudgetSettingsContext";
import { useToast } from "@/hooks/useToast";

interface BudgetShellProps {
  children: React.ReactNode;
}

type ModalState =
  | { type: "none" }
  | { type: "loading"; message: string }
  | { type: "confirm-clear" }
  | { type: "confirm-reset" };

export default function BudgetShell({ children }: BudgetShellProps) {
  const router = useRouter();
  const settings = useBudgetSettings();
  const { toasts, toast, dismiss } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const isDark = settings.theme === "dark";

  // ── Reset (load sample data) ─────────────────────────────────────────────
  const handleReset = () => setModal({ type: "confirm-reset" });

  const doReset = async () => {
    setModal({ type: "loading", message: "Loading sample data…" });
    await new Promise((r) => setTimeout(r, 800));
    loadSampleData(); // dispatches bt_reload → usePeriods re-reads
    setModal({ type: "none" });
    toast("Sample data loaded", "success");
    router.push("/budget-tracker");
  };

  // ── Clear all data ───────────────────────────────────────────────────────
  const handleClear = () => setModal({ type: "confirm-clear" });

  const doClear = async () => {
    setModal({ type: "loading", message: "Clearing all data…" });
    await new Promise((r) => setTimeout(r, 600));
    clearAllData(); // dispatches bt_reload → usePeriods re-reads
    setModal({ type: "none" });
    toast("All data cleared", "info");
    router.push("/budget-tracker");
  };

  const [leaving, setLeaving] = useState(false);

  const handleBack = () => {
    setLeaving(true);
    // Let the fade-in complete (400ms), hold briefly, then navigate
    setTimeout(() => router.push("/"), 900);
  };
  const handleOverview = () => router.push("/budget-tracker");

  return (
    <BudgetSettingsContext.Provider value={settings}>
      <div
        className="bt-root flex min-h-screen"
        data-bt-theme={settings.theme}
        style={{
          background: isDark ? "#090D16" : "#F4F6F9",
          color: isDark ? "#E2E8F0" : "#0F172A",
        }}
      >
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60 z-20">
          <Sidebar
            onBack={handleBack}
            onOverview={handleOverview}
            onReset={handleReset}
            onClear={handleClear}
            onToast={toast}
          />
        </div>

        {/* Mobile overlay drawer */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(11,19,37,0.6)", backdropFilter: "blur(3px)" }}
              onClick={() => setDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
              <Sidebar
                onBack={handleBack}
                onOverview={handleOverview}
                onReset={handleReset}
                onClear={handleClear}
                onToast={toast}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:pl-60">
          {/* Mobile top bar */}
          <div
            className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
            style={{ background: "#0F172A", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 rounded-md"
              style={{ color: "#94A3B8" }}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect y="2"  width="18" height="2" rx="1"/>
                <rect y="8"  width="18" height="2" rx="1"/>
                <rect y="14" width="18" height="2" rx="1"/>
              </svg>
            </button>
            <span className="text-sm font-bold" style={{ color: "#E2E8F0" }}>Budget Engine</span>
            <button onClick={handleBack} className="text-xs font-mono" style={{ color: "#4A6FA5" }}>
              ← Portfolio
            </button>
          </div>

          <main className="flex-1 pb-24 lg:pb-8">{children}</main>
        </div>

        {/* Toasts */}
        <ToastContainer toasts={toasts} dismiss={dismiss} isDark={isDark} />

        {/* Entry splash — first load only, fades out automatically */}
        <BudgetSplash />

        {/* Goodbye overlay — fades in when navigating back to portfolio */}
        {leaving && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 99998,
              background: "#090D16",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
              animation: "bt-farewell-in 400ms cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="26" stroke="#1E293B" strokeWidth="5"/>
              <path d="M32 6 A26 26 0 1 1 6 32" stroke="url(#byeGrad)" strokeWidth="5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="byeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488"/>
                  <stop offset="100%" stopColor="#2DD4BF"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#2DD4BF", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                See you next time
              </p>
              <h2 style={{ color: "#F8FAFC", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                Back to Portfolio
              </h2>
            </div>
            <style>{`
              @keyframes bt-farewell-in {
                from { opacity: 0; transform: scale(1.04); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        )}

        {/* Modals */}
        {modal.type === "loading" && (
          <LoadingOverlay message={modal.message} isDark={isDark} />
        )}

        {modal.type === "confirm-reset" && (
          <ConfirmModal
            title="Load Sample Data"
            message="This will add demo periods to your existing data. Your current periods will not be affected."
            confirmLabel="Load"
            isDark={isDark}
            onConfirm={doReset}
            onCancel={() => setModal({ type: "none" })}
          />
        )}

        {modal.type === "confirm-clear" && (
          <ConfirmModal
            title="Clear All Data"
            message="This will permanently delete all your budget periods and expenses. This cannot be undone."
            confirmLabel="Clear Everything"
            danger
            isDark={isDark}
            onConfirm={doClear}
            onCancel={() => setModal({ type: "none" })}
          />
        )}
      </div>
    </BudgetSettingsContext.Provider>
  );
}
