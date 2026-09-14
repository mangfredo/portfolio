"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePeriods } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import Modal from "@/components/budget/Modal";

export default function BudgetHome() {
  const router = useRouter();
  const { periods, addPeriod, deletePeriod } = usePeriods();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");

  // Swipe left or right → go home
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <div>
          <p
            className="font-mono text-[0.65rem] uppercase tracking-widest mb-1"
            style={{ color: "var(--accent-bright)" }}
          >
            Budget Tracker
          </p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Pay Periods
          </h1>
        </div>
        {/* Back link — desktop only */}
        <a
          href="/"
          className="hidden sm:inline font-mono text-xs transition-colors hover:text-[var(--accent-bright)]"
          style={{ color: "var(--fg-muted)" }}
        >
          ← Portfolio
        </a>
      </header>

      {/* List or empty state */}
      <main className="flex-1 px-5 py-4">
        {periods.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[55vh] gap-6">
            <p
              className="font-mono text-sm text-center"
              style={{ color: "var(--fg-muted)" }}
            >
              No periods yet.
              <br />
              Add your first one to get started.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-8 py-3 rounded-xl font-mono text-sm font-bold transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              + Add Period
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {periods.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => router.push(`/budget-tracker/${p.id}`)}
                  className="w-full text-left rounded-xl border px-5 py-4 flex items-center justify-between transition-colors group"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <div>
                    <p className="font-semibold text-base">{p.label}</p>
                    <p
                      className="font-mono text-xs mt-0.5"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {p.budget > 0
                        ? `Budget: ₱${p.budget.toLocaleString()}`
                        : "Budget not set"}
                    </p>
                  </div>
                  <span
                    className="font-mono text-sm transition-colors group-hover:text-[var(--accent-bright)]"
                    style={{ color: "var(--accent)" }}
                  >
                    →
                  </span>
                </button>
                {/* Long-press / swipe hint: delete via dedicated button */}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* FAB — only when items exist */}
      {periods.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-8 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-transform active:scale-95"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
          aria-label="Add period"
        >
          +
        </button>
      )}

      {/* Add Period modal */}
      {showAdd && (
        <Modal title="New Period" onClose={() => { setShowAdd(false); setLabel(""); }}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="period-label"
                className="block font-mono text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--fg-muted)" }}
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
                className="w-full rounded-lg border px-4 py-3 text-sm bg-transparent outline-none focus:border-[var(--accent)]"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--fg)",
                }}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowAdd(false); setLabel(""); }}
                className="flex-1 py-3 rounded-lg border font-mono text-sm transition-colors"
                style={{ borderColor: "var(--card-border)", color: "var(--fg-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!label.trim()}
                className="flex-1 py-3 rounded-lg font-mono text-sm font-bold transition-colors disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
