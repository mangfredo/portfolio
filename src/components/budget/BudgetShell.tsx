"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar, { type ActiveTab } from "./Sidebar";
import ToastContainer from "./ToastContainer";
import { LoadingOverlay, ConfirmModal } from "./BudgetModal";
import { loadSampleDataForTab, clearTabData, hasTabData } from "@/lib/budgetSampleData";
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

function pathToTab(pathname: string): ActiveTab {
  if (pathname.startsWith("/budget-tracker/loans"))   return "loans";
  if (pathname.startsWith("/budget-tracker/savings")) return "savings";
  return "pay-periods";
}

export default function BudgetShell({ children }: BudgetShellProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const settings = useBudgetSettings();
  const { toasts, toast, dismiss } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [leaving, setLeaving] = useState(false);

  const isDark    = settings.theme === "dark";
  const activeTab = pathToTab(pathname ?? "");

  // ── Reactive hasData — re-checks on tab change and bt_reload events ──────
  const [hasData, setHasData] = useState(false);
  useEffect(() => {
    setHasData(hasTabData(activeTab));
    const handler = () => setHasData(hasTabData(activeTab));
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, [activeTab]);

  // ── Tab label for modal/toast text ──────────────────────────────────────
  const tabLabel = activeTab === "pay-periods" ? "Pay Period"
    : activeTab === "loans" ? "Loan"
    : "Savings";

  // ── Reset (load sample data for current tab) ─────────────────────────────
  const handleReset = () => setModal({ type: "confirm-reset" });
  const doReset = async () => {
    setModal({ type: "loading", message: `Loading ${tabLabel} sample data…` });
    await new Promise((r) => setTimeout(r, 800));
    loadSampleDataForTab(activeTab);
    setModal({ type: "none" });
    toast(`${tabLabel} sample data loaded`, "success");
  };

  // ── Clear data for current tab ───────────────────────────────────────────
  const handleClear = () => setModal({ type: "confirm-clear" });
  const doClear = async () => {
    setModal({ type: "loading", message: `Clearing ${tabLabel} data…` });
    await new Promise((r) => setTimeout(r, 600));
    clearTabData(activeTab);
    setModal({ type: "none" });
    toast(`${tabLabel} data cleared`, "info");
  };

  const handleBack = () => {
    setLeaving(true);
    setTimeout(() => router.push("/"), 1800);
  };

  const sidebarProps = {
    activeTab,
    hasData,
    onBack:       handleBack,
    onPayPeriods: () => router.push("/budget-tracker"),
    onLoans:      () => router.push("/budget-tracker/loans"),
    onSavings:    () => router.push("/budget-tracker/savings"),
    onReset:      handleReset,
    onClear:      handleClear,
    onToast:      toast,
  };

  return (
    <BudgetSettingsContext.Provider value={settings}>
      <div
        className="bt-root flex min-h-screen"
        data-bt-theme={settings.theme}
        suppressHydrationWarning
        style={{
          background: isDark ? "#090D16" : "#F4F6F9",
          color: isDark ? "#E2E8F0" : "#0F172A",
        }}
      >
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60 z-20">
          <Sidebar {...sidebarProps} />
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
              <Sidebar {...sidebarProps} />
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

        {/* Goodbye overlay */}
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
            <img src="/wave-cute.gif" alt="Waving goodbye" style={{ width: 120, height: 120, objectFit: "contain" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#2DD4BF", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                See you next time
              </p>
              <h2 style={{ color: "#F8FAFC", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                Back to Portfolio
              </h2>
            </div>
            <style>{`@keyframes bt-farewell-in { from { opacity:0; transform:scale(1.04); } to { opacity:1; transform:scale(1); } }`}</style>
          </div>
        )}

        {/* Modals */}
        {modal.type === "loading" && <LoadingOverlay message={modal.message} isDark={isDark} />}

        {modal.type === "confirm-reset" && (
          <ConfirmModal
            title={`Load ${tabLabel} Sample Data`}
            message={`This will add sample ${tabLabel.toLowerCase()} entries to your existing data. Your current entries will not be affected.`}
            confirmLabel="Load"
            isDark={isDark}
            onConfirm={doReset}
            onCancel={() => setModal({ type: "none" })}
          />
        )}

        {modal.type === "confirm-clear" && (
          <ConfirmModal
            title={`Clear ${tabLabel} Data`}
            message={`This will permanently delete all your ${tabLabel.toLowerCase()} data. This cannot be undone.`}
            confirmLabel="Clear"
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
