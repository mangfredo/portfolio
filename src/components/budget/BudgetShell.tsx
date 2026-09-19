"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import TopNav from "./TopNav";
import type { ActiveTab } from "./Sidebar";
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
  | { type: "confirm-reset" }
  | { type: "confirm-back" };

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
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [leaving, setLeaving] = useState(false);

  const activeTab = pathToTab(pathname ?? "");

  const [hasData, setHasData] = useState(false);
  useEffect(() => {
    setHasData(hasTabData(activeTab));
    const handler = () => setHasData(hasTabData(activeTab));
    window.addEventListener("bt_reload", handler);
    return () => window.removeEventListener("bt_reload", handler);
  }, [activeTab]);

  const tabLabel = activeTab === "pay-periods" ? "Pay Period"
    : activeTab === "loans" ? "Loan" : "Savings";

  const handleReset = () => setModal({ type: "confirm-reset" });
  const doReset = async () => {
    setModal({ type: "loading", message: `Loading ${tabLabel} sample data…` });
    await new Promise((r) => setTimeout(r, 800));
    loadSampleDataForTab(activeTab);
    setModal({ type: "none" });
    toast(`${tabLabel} sample data loaded`, "success");
  };

  const handleClear = () => setModal({ type: "confirm-clear" });
  const doClear = async () => {
    setModal({ type: "loading", message: `Clearing ${tabLabel} data…` });
    await new Promise((r) => setTimeout(r, 600));
    clearTabData(activeTab);
    setModal({ type: "none" });
    toast(`${tabLabel} data cleared`, "info");
  };

  const handleBack = () => {
    setModal({ type: "confirm-back" });
  };

  const doBack = () => {
    setModal({ type: "none" });
    setLeaving(true);
    setTimeout(() => router.push("/"), 1800);
  };

  return (
    <BudgetSettingsContext.Provider value={settings}>
      <div
        className="wf-root flex flex-col"
        data-theme={settings.theme}
        style={{
          minHeight: "100vh",
          background: settings.theme === "dark" ? "#0F172A" : "#F0F4F8",
          color: settings.theme === "dark" ? "#F1F5F9" : "#0F172A",
          overflowX: "hidden",
        }}
        suppressHydrationWarning
      >
        <TopNav
          activeTab={activeTab}
          hasData={hasData}
          onBack={handleBack}
          onPayPeriods={() => router.push("/budget-tracker")}
          onLoans={() => router.push("/budget-tracker/loans")}
          onSavings={() => router.push("/budget-tracker/savings")}
          onReset={handleReset}
          onClear={handleClear}
          onToast={toast}
        />

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24 sm:pb-0">{children}</main>

        <ToastContainer toasts={toasts} dismiss={dismiss} isDark={settings.theme === "dark"} />

        {/* Goodbye overlay */}
        {leaving && (
          <div style={{
            position:"fixed", inset:0, zIndex:99998,
            background:"#0F172A",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:20,
            animation:"wf-fade-in 400ms ease forwards",
          }}>
            <img src="/wave-cute.gif" alt="Goodbye" style={{ width:120, height:120, objectFit:"contain" }} />
            <div style={{ textAlign:"center" }}>
              <p style={{ color:"#22D3EE", fontSize:"0.65rem", letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 6px" }}>
                See you next time
              </p>
              <h2 style={{ color:"#F1F5F9", fontSize:"1.25rem", fontWeight:700, margin:0 }}>
                Back to Portfolio
              </h2>
            </div>
          </div>
        )}

        {modal.type === "loading" && (
          <LoadingOverlay message={modal.message} isDark={settings.theme === "dark"} />
        )}
        {modal.type === "confirm-reset" && (
          <ConfirmModal
            title={`Load ${tabLabel} Sample Data`}
            message={`This will add sample ${tabLabel.toLowerCase()} entries to your existing data.`}
            confirmLabel="Load"
            isDark={settings.theme === "dark"}
            onConfirm={doReset}
            onCancel={() => setModal({ type: "none" })}
          />
        )}
        {modal.type === "confirm-clear" && (
          <ConfirmModal
            title={`Clear ${tabLabel} Data`}
            message={`This will permanently delete all your ${tabLabel.toLowerCase()} data.`}
            confirmLabel="Clear"
            danger
            isDark={settings.theme === "dark"}
            onConfirm={doClear}
            onCancel={() => setModal({ type: "none" })}
          />
        )}
        {modal.type === "confirm-back" && (
          <ConfirmModal
            title="Back to Portfolio?"
            message="Your data is saved locally and will be here when you return. Ready to leave WealthFlow?"
            confirmLabel="Leave"
            isDark={settings.theme === "dark"}
            onConfirm={doBack}
            onCancel={() => setModal({ type: "none" })}
          />
        )}
      </div>
    </BudgetSettingsContext.Provider>
  );
}
