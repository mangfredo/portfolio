"use client";

import "./budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePeriods } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import Modal from "@/components/budget/Modal";
import BudgetShell from "@/components/budget/BudgetShell";

export default function BudgetHome() {
  const router = useRouter();
  const { theme } = useBudgetSettingsCtx();
  const isDark = theme === "dark";
  const textMain  = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#415A77";
  const cardBg    = isDark ? "#111D35" : "#FFFFFF";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "#CBD5E1";

  const { periods, addPeriod } = usePeriods();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");

  useSwipeToClose("/");

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const period = addPeriod(trimmed);
    setLabel("");
    setShowAdd(false);
    router.push(`/budget-tracker/${period.id}`);
  };

  return (
    <BudgetShell>
      <div className="px-6 pt-8 pb-4 max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <p className="bt-text-muted text-xs uppercase tracking-[0.14em] font-medium mb-1">
            Overview
          </p>
          <h2 className="bt-text-main text-2xl font-semibold tracking-tight">
            Pay Periods
          </h2>
          <p className="bt-text-muted text-sm mt-1">
            Select a period to view its budget breakdown.
          </p>
        </div>

        {periods.length === 0 ? (
          <div
            className="bt-card flex flex-col items-center justify-center py-20 px-8 text-center"
            style={{ borderStyle: "dashed" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-2xl"
              style={{ background: isDark ? "#1E293B" : "#EAEFF5", color: isDark ? "#2DD4BF" : "#0D9488" }}
            >
              ₱
            </div>
            <p className="bt-text-main font-semibold text-base mb-1">No periods yet</p>
            <p className="bt-text-muted text-sm mb-6">
              Create your first pay period to start tracking your budget.
            </p>
            <button onClick={() => setShowAdd(true)} className="bt-btn-primary px-6 py-2.5">
              + New Period
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/budget-tracker/${p.id}`)}
                className="bt-card w-full text-left px-5 py-4 flex items-center justify-between group"
                style={{ borderRadius: "8px", background: cardBg, border: `1px solid ${borderCol}`, color: textMain, boxShadow: isDark ? "0 4px 20px -2px rgba(0,0,0,0.5)" : "0 1px 3px 0 rgba(11,19,37,0.05)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold bt-data"
                    style={{ background: isDark ? "#1E293B" : "#EAEFF5", color: isDark ? "#2DD4BF" : "#0D9488" }}
                  >
                    ₱
                  </div>
                  <div>
                    <p className="bt-text-main font-semibold text-sm">{p.label}</p>
                    <p className="bt-text-muted text-xs mt-0.5 bt-data">
                      {p.budget > 0
                        ? `₱${p.budget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                        : "Budget not set"}
                    </p>
                  </div>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                  style={{ color: "#CBD5E1" }}
                >
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {periods.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="bt-btn-primary fixed bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ boxShadow: "0 8px 24px rgba(13,148,136,0.35), 0 2px 8px rgba(0,0,0,0.3)" }}
          aria-label="Add period"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="18" />
            <line x1="4" y1="11" x2="18" y2="11" />
          </svg>
        </button>
      )}

      {/* Modal */}
      {showAdd && (
        <Modal
          title="New Pay Period"
          onClose={() => { setShowAdd(false); setLabel(""); }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="period-label"
                className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: "#64748B" }}
              >
                Label
              </label>
              <input
                id="period-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder="e.g. September 15, 2026"
                autoFocus
                className="bt-input"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowAdd(false); setLabel(""); }}
                className="bt-btn-ghost flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!label.trim()}
                className="bt-btn-primary flex-1 py-2.5"
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}
    </BudgetShell>
  );
}
