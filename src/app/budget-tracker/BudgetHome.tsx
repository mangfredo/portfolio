"use client";

import "./budget.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarBlank, Plus, ArrowRight, Wallet } from "@phosphor-icons/react";
import { usePeriods, useExpenses } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import Modal from "@/components/budget/Modal";
import BudgetShell from "@/components/budget/BudgetShell";
import BudgetSplash from "@/components/budget/BudgetSplash";
import { PeriodDetailInner } from "./[id]/PeriodDetail";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PeriodCard({ period, currencySymbol, onClick }: {
  period: { id: string; label: string; budget: number };
  currencySymbol: string;
  onClick: () => void;
}) {
  const { expenses, total } = useExpenses(period.id);
  const remaining = period.budget - total;
  const burnRate  = period.budget > 0 ? Math.min((total / period.budget) * 100, 100) : 0;
  const isOver    = remaining < 0;
  const isLow     = !isOver && period.budget > 0 && remaining < period.budget * 0.15;

  const progressColor = isOver ? "wf-progress-fill-pink"
    : isLow ? "wf-progress-fill-warn"
    : "wf-progress-fill";

  return (
    <motion.button
      onClick={onClick}
      className="wf-glass w-full text-left p-5 relative overflow-hidden group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.25 }}
    >
      {/* ambient glow */}
      <div style={{
        position:"absolute", top:0, right:0, width:"60%", height:"100%",
        background:"radial-gradient(200px circle at 100% 0%, rgba(34,211,238,0.08), transparent 70%)",
        pointerEvents:"none",
      }}/>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:"var(--wf-cyan-dim)", border:"1px solid rgba(56,189,248,0.20)" }}>
              <CalendarBlank size={18} color="var(--wf-cyan)" weight="fill" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color:"var(--wf-text)" }}>{period.label}</p>
              <p className="wf-data text-xs mt-0.5" style={{ color:"var(--wf-muted)" }}>
                {period.budget > 0 ? `${currencySymbol}${fmt(period.budget)}` : "Budget not set"}
              </p>
            </div>
          </div>
          <ArrowRight size={16} color="#475569"
            className="transition-transform group-hover:translate-x-1 mt-1 flex-shrink-0" />
        </div>

        {period.budget > 0 && (
          <>
            <div className="wf-progress-track mb-2">
              <div className={`wf-progress-fill ${progressColor}`} style={{ width:`${burnRate}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color:"var(--wf-muted)" }}>{burnRate.toFixed(0)}% spent</span>
              <span className="wf-data font-semibold" style={{ color: isOver ? "var(--wf-pink)" : "var(--wf-emerald)" }}>
                {isOver ? "-" : "+"}{currencySymbol}{fmt(Math.abs(remaining))} {isOver ? "over" : "left"}
              </span>
            </div>
          </>
        )}

        {/* Expense count badge */}
        {expenses.length > 0 && (
          <div className="mt-3">
            <span className="wf-badge wf-badge-cyan">{expenses.length} expenses</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

function BudgetHomeInner() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { currencySymbol } = useBudgetSettingsCtx();
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
    setSelectedId(period.id);
  };

  // Render period detail inline — no route change, splash never replays
  if (selectedId) {
    return (
      <>
        <BudgetSplash />
        <PeriodDetailInner id={selectedId} onBack={() => setSelectedId(null)} />
      </>
    );
  }

  return (
    <>
      <BudgetSplash />
      <div className="px-6 pt-6 pb-24 mx-auto" style={{ maxWidth: 1200 }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color:"var(--wf-cyan)" }}>
                Overview
              </p>
              <h1 className="font-bold text-2xl tracking-tight" style={{ color:"var(--wf-text)" }}>
                Pay Periods
              </h1>
              <p className="text-sm mt-1" style={{ color:"var(--wf-muted)" }}>
                Select a period to view its dashboard.
              </p>
            </div>
            {periods.length > 0 && (
              <motion.button
                onClick={() => setShowAdd(true)}
                className="wf-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={14} weight="bold" />
                New Period
              </motion.button>
            )}
          </div>
        </motion.div>

        {periods.length === 0 ? (
          <motion.div
            initial={{ opacity:0, scale:0.97 }}
            animate={{ opacity:1, scale:1 }}
            className="wf-glass flex flex-col items-center justify-center py-24 px-8 text-center"
            style={{ borderStyle:"dashed" }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background:"var(--wf-cyan-dim)", border:"1px solid rgba(56,189,248,0.20)" }}>
              <Wallet size={28} color="var(--wf-cyan)" weight="fill" />
            </div>
            <p className="font-bold text-lg mb-2" style={{ color:"var(--wf-text)" }}>No periods yet</p>
            <p className="text-sm mb-8" style={{ color:"var(--wf-muted)" }}>
              Create your first pay period to start tracking your budget.
            </p>
            <motion.button
              onClick={() => setShowAdd(true)}
              className="wf-btn-primary flex items-center gap-2 px-6 py-3"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={15} weight="bold" />
              New Period
            </motion.button>
          </motion.div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            <AnimatePresence>
              {periods.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.05 }}>
                  <PeriodCard
                    period={p}
                    currencySymbol={currencySymbol}
                    onClick={() => setSelectedId(p.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* New period tile */}
            <motion.button
              onClick={() => setShowAdd(true)}
              className="wf-glass flex flex-col items-center justify-center py-12 transition-all"
              style={{ borderStyle:"dashed", minHeight:140 }}
              whileHover={{ scale:1.02 }}
              initial={{ opacity:0 }} animate={{ opacity:1 }}
            >
              <Plus size={22} color="#475569" className="mb-2" />
              <span className="text-sm font-medium" style={{ color:"#475569" }}>New Period</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAdd && (
        <Modal title="New Pay Period" onClose={() => { setShowAdd(false); setLabel(""); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>
                Label
              </label>
              <input
                type="text" value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder="e.g. September 15, 2026"
                autoFocus className="wf-input"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setLabel(""); }} className="wf-btn-ghost flex-1 py-2.5">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!label.trim()} className="wf-btn-primary flex-1 py-2.5">
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default function BudgetHome() {
  return <BudgetShell><BudgetHomeInner /></BudgetShell>;
}
