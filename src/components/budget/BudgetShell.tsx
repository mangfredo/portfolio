"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { loadSampleData, clearAllData } from "@/lib/budgetSampleData";

interface BudgetShellProps {
  children: React.ReactNode;
}

export default function BudgetShell({ children }: BudgetShellProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleReset = () => {
    loadSampleData();
    window.location.href = "/budget-tracker";
  };

  const handleClear = () => {
    if (confirm("Clear all budget data? This cannot be undone.")) {
      clearAllData();
      window.location.href = "/budget-tracker";
    }
  };

  const handleBack = () => router.push("/");

  return (
    <div className="bt-root flex min-h-screen">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60">
        <Sidebar onBack={handleBack} onReset={handleReset} onClear={handleClear} />
      </div>

      {/* Mobile overlay drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(11,19,37,0.55)", backdropFilter: "blur(3px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <Sidebar onBack={handleBack} onReset={handleReset} onClear={handleClear} />
          </div>
        </>
      )}

      {/* Main content — offset for sidebar on desktop */}
      <div className="flex-1 flex flex-col lg:pl-60">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: "#111D35", borderColor: "rgba(255,255,255,0.07)" }}
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
          <button
            onClick={handleBack}
            className="text-xs font-mono"
            style={{ color: "#4A6FA5" }}
          >
            ← Portfolio
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
