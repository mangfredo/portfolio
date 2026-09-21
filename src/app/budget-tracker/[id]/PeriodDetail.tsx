"use client";

import "../budget.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash, Plus, ArrowLeft, ChartBar, Tag } from "@phosphor-icons/react";
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Legend,
} from "recharts";
import { usePeriods, useExpenses } from "@/hooks/useBudgetStore";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import { useCountUp } from "@/hooks/useCountUp";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import Modal from "@/components/budget/Modal";
import { ConfirmModal } from "@/components/budget/BudgetModal";
import BudgetShell from "@/components/budget/BudgetShell";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

interface Props { id: string; }

const CAT_COLORS = ["var(--wf-cyan)","var(--wf-pink)","var(--wf-emerald)","#F59E0B","#8B5CF6","#F97316","#06B6D4","#84CC16","#A855F7","#14B8A6"];

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AnimatedValue({ value, prefix = "" }: { value: number; prefix?: string }) {
  const v = useCountUp({ target: value, duration: 700, enabled: value > 0 });
  return <>{prefix}{fmt(Math.round(v))}</>;
}

function GlassTooltip({ active, payload, label, sym = "" }: {
  active?: boolean; payload?: Array<{ value: number; fill?: string; color?: string; name?: string }>;
  label?: string; sym?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(15,23,42,0.92)", backdropFilter:"blur(8px)",
      border:"1px solid rgba(255,255,255,0.10)", borderRadius:12, padding:"12px 16px", minWidth:140 }}>
      <p style={{ color:"var(--wf-muted)", fontSize:"0.75rem", marginBottom:8 }}>{label}</p>
      {payload.map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color:"var(--wf-text)" }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:item.fill||item.color, flexShrink:0 }}/>
          <span style={{ flex:1, fontSize:"0.75rem" }}>{item.name}:</span>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.75rem", fontWeight:700 }}>
            {sym}{fmt(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function buildWaterfall(budget: number, expenses: { name: string; amount: number }[]) {
  const bars: { label: string; start: number; up: number; down: number; isNet?: boolean }[] = [];
  let cursor = 0;
  bars.push({ label:"Start", start:0, up:0, down:0 });
  bars.push({ label:"Budget", start:0, up:budget, down:0 });
  cursor = budget;
  for (const e of expenses) {
    bars.push({ label:e.name, start:cursor-e.amount, up:0, down:e.amount });
    cursor -= e.amount;
  }
  bars.push({ label:"Net", start:0, up:Math.max(cursor,0), down:0, isNet:true });
  return bars;
}

export default function PeriodDetail({ id }: Props) {
  return <BudgetShell><PeriodDetailInner id={id} /></BudgetShell>;
}

function PeriodDetailInner({ id }: Props) {
  const router = useRouter();
  const { currencySymbol } = useBudgetSettingsCtx();
  const { periods, updateBudget, deletePeriod } = usePeriods();
  const { expenses, addExpense, updateExpense, deleteExpense, togglePaid, total } = useExpenses(id);

  useSwipeToClose("/budget-tracker");

  const period    = periods.find(p => p.id === id);
  const budget    = period?.budget ?? 0;
  const remaining = budget - total;
  const burnRate  = budget > 0 ? (total / budget) * 100 : 0;
  const isOver    = remaining < 0;

  // Balance waterfall data — starting balance depleting through each expense
  const cashflowData = (() => {
    let running = budget;
    return [
      { label: "Start", balance: budget },
      ...expenses.map((e) => {
        running = Math.max(running - e.amount, 0);
        return { label: e.name, balance: running };
      }),
    ];
  })();

  const [showBudgetModal, setShowBudgetModal]   = useState(false);
  const [showItemModal, setShowItemModal]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingId, setEditingId]               = useState<string | null>(null);
  const [budgetInput, setBudgetInput]           = useState("");
  const [itemName, setItemName]                 = useState("");
  const [itemAmount, setItemAmount]             = useState("");

  const handleSetBudget = () => {
    const val = parseNumeric(budgetInput);
    if (isNaN(val) || val < 0) return;
    updateBudget(id, val);
    setBudgetInput(""); setShowBudgetModal(false);
  };

  const handleAddItem = () => {
    const name   = itemName.trim();
    const amount = parseNumeric(itemAmount);
    if (!name || isNaN(amount) || amount < 0) return;
    if (editingId) { updateExpense(editingId, name, amount); setEditingId(null); }
    else { addExpense(name, amount); }
    setItemName(""); setItemAmount(""); setShowItemModal(false);
  };

  const openEdit = (e: { id: string; name: string; amount: number }) => {
    setItemName(e.name); setItemAmount(String(e.amount));
    setEditingId(e.id); setShowItemModal(true);
  };
  const closeItemModal = () => {
    setShowItemModal(false); setItemName(""); setItemAmount(""); setEditingId(null);
  };

  const waterfallData = buildWaterfall(budget, expenses);
  const pieData = expenses.map(e => ({ name:e.name, value:e.amount }));
  const progressColor = isOver ? "wf-progress-fill-pink"
    : burnRate > 80 ? "wf-progress-fill-warn"
    : "wf-progress-fill";

  if (!period && periods.length > 0) { router.replace("/budget-tracker"); return null; }

  return (
    <>
      <div className="px-6 pt-6 pb-24 mx-auto" style={{ maxWidth:1200 }}>

        {/* Back + header */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <button onClick={() => router.push("/budget-tracker")}
            className="flex items-center gap-1.5 text-xs font-medium mb-4 transition-opacity hover:opacity-70"
            style={{ color:"var(--wf-muted)" }}>
            <ArrowLeft size={13}/> All Periods
          </button>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color:"var(--wf-cyan)" }}>
                Pay Period
              </p>
              <h1 className="font-bold text-2xl tracking-tight" style={{ color:"var(--wf-text)" }}>
                {period?.label ?? "…"}
              </h1>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color:"var(--wf-pink)", background:"var(--wf-pink-dim)", border:"1px solid rgba(244,63,94,0.20)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M5 3V2h2v1M4 3l.5 7h3L8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        </motion.div>

        {/* Hero balance card */}
        <motion.div className="wf-glass p-6 mb-6 relative overflow-hidden"
          initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}>
          <div style={{
            position:"absolute", top:0, right:0, width:"55%", height:"100%",
            background:"radial-gradient(350px circle at 100% 0%, rgba(34,211,238,0.10), transparent 70%)",
            pointerEvents:"none",
          }}/>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-1" style={{ color:"var(--wf-muted)" }}>
                Available Balance
              </p>
              <p className="wf-data font-bold" style={{ fontSize:"2.5rem", lineHeight:1.1,
                color: isOver ? "var(--wf-pink)" : "var(--wf-cyan)" }}>
                {budget > 0
                  ? <AnimatedValue value={Math.abs(remaining)} prefix={isOver ? `-${currencySymbol}` : currencySymbol}/>
                  : "—"}
              </p>
              {budget === 0 && (
                <button onClick={() => { setBudgetInput(""); setShowBudgetModal(true); }}
                  className="text-xs font-semibold mt-2" style={{ color:"var(--wf-cyan)" }}>
                  Set budget →
                </button>
              )}
            </div>
            {budget > 0 && (
              <div className="sm:text-right" style={{ minWidth:160 }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>
                  Burn Rate
                </p>
                <div className="wf-progress-track mb-1" style={{ width:"100%" }}>
                  <div className={`wf-progress-fill ${progressColor}`}
                    style={{ width:`${Math.min(burnRate,100)}%` }}/>
                </div>
                <p className="text-xs font-semibold" style={{ color: isOver ? "var(--wf-pink)" : "#94A3B8" }}>
                  {burnRate.toFixed(1)}% of {currencySymbol}{fmt(budget)}
                  {budget > 0 && (
                    <button onClick={() => { setBudgetInput(String(budget)); setShowBudgetModal(true); }}
                      className="ml-2" style={{ color:"var(--wf-cyan)" }}>
                      <Pencil size={11}/>
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 3 metric cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Budget", value: budget > 0 ? `${currencySymbol}${fmt(budget)}` : "—", color:"var(--wf-text)" },
            { label:"Total Spent",  value: `${currencySymbol}${fmt(total)}`, color:"var(--wf-pink)" },
            { label:"Remaining",    value: budget > 0 ? `${isOver?"-":""}${currencySymbol}${fmt(Math.abs(remaining))}` : "—",
              color: budget===0?"#94A3B8":isOver?"var(--wf-pink)":"var(--wf-emerald)" },
          ].map(({ label, value, color }, i) => (
            <motion.div key={label} className="wf-glass p-4"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>{label}</p>
              <p className="wf-data text-xl font-bold" style={{ color }}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        {expenses.length > 0 && budget > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20, marginBottom:24 }}>
            {/* Balance waterfall — AreaChart showing running balance */}
            <motion.div className="wf-glass p-5" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
              <div className="flex items-center gap-2 mb-4">
                <ChartBar size={15} color="var(--wf-cyan)"/>
                <div>
                  <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>Cash Flow</p>
                  <p className="text-xs" style={{ color:"var(--wf-muted)" }}>Balance waterfall</p>
                </div>
              </div>
              <div style={{ width:"100%", height:220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflowData} margin={{ top:4, right:8, left:0, bottom:0 }}>
                    <defs>
                      <linearGradient id="wfCashArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--wf-cyan)" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="var(--wf-cyan)" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid horizontal vertical={false} strokeDasharray="4 4"/>
                    <XAxis dataKey="label" tick={{ fontSize:10, fill:"var(--wf-muted)" }} axisLine={false} tickLine={false}
                      interval="preserveStartEnd"/>
                    <YAxis tick={{ fontSize:10, fill:"var(--wf-muted)" }} axisLine={false} tickLine={false}
                      tickFormatter={v=>`${currencySymbol}${(v/1000).toFixed(0)}k`} width={48}/>
                    <Tooltip content={<GlassTooltip sym={currencySymbol}/>}/>
                    <Area type="monotone" dataKey="balance" name="Balance" stroke="var(--wf-cyan)" strokeWidth={2}
                      fill="url(#wfCashArea)" dot={false}
                      activeDot={{ r:5, fill:"var(--wf-cyan)", stroke:"rgba(15,23,42,0.8)", strokeWidth:2 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Donut */}
            {pieData.length > 0 && (
              <motion.div className="wf-glass p-5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={15} color="var(--wf-cyan)"/>
                  <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>Expense Allocation</p>
                </div>
                <div style={{ width:"100%", height:220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="45%" innerRadius={52} outerRadius={76}
                        paddingAngle={2} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i%CAT_COLORS.length]}/>)}
                      </Pie>
                      <Tooltip content={<GlassTooltip sym={currencySymbol}/>}/>
                      <Legend iconType="circle" iconSize={7}
                        wrapperStyle={{ fontSize:"11px", color:"var(--wf-muted)", lineHeight:"1.7" }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Expense table */}
        <motion.div className="wf-glass overflow-hidden" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--wf-muted)" }}>Expenses</p>
            <button onClick={() => setShowItemModal(true)} className="wf-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <Plus size={12} weight="bold"/> Add Item
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm" style={{ color:"var(--wf-muted)" }}>No expenses recorded yet.</p>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", padding:"10px 20px",
                background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:"#475569" }}>Item</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color:"#475569" }}>Amount</span>
              </div>

              <AnimatePresence>
                {expenses.map((e) => (
                  <motion.button key={e.id} onClick={() => openEdit(e)}
                    className="wf-row w-full"
                    style={{ display:"grid", gridTemplateColumns:"1fr auto", padding:"14px 20px",
                      borderBottom:"1px solid rgba(255,255,255,0.04)", textAlign:"left" }}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                    <span className="text-sm font-medium truncate pr-4"
                      style={{ color: e.paid ? "#475569" : "var(--wf-text)",
                        textDecoration: e.paid ? "line-through" : "none" }}>
                      {e.name}
                    </span>
                    <span className="wf-data text-sm text-right"
                      style={{ color: e.paid ? "#475569" : "var(--wf-text)",
                        textDecoration: e.paid ? "line-through" : "none" }}>
                      {currencySymbol}{fmt(e.amount)}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Total */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", padding:"14px 20px",
                background:"rgba(244,63,94,0.06)", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--wf-pink)" }}>Total Spent</span>
                <span className="wf-data text-sm font-bold text-right" style={{ color:"var(--wf-pink)" }}>
                  {currencySymbol}{fmt(total)}
                </span>
              </div>

              {/* Remaining */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", padding:"14px 20px" }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--wf-muted)" }}>Remaining</span>
                <span className="wf-data text-sm font-bold text-right"
                  style={{ color: budget===0?"#94A3B8":isOver?"var(--wf-pink)":"var(--wf-emerald)" }}>
                  {budget > 0 ? `${isOver?"-":""}${currencySymbol}${fmt(Math.abs(remaining))}` : "—"}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* FAB */}
      {expenses.length > 0 && (
        <button onClick={() => setShowItemModal(true)} className="wf-fab fixed bottom-8 right-6" aria-label="Add expense">
          <Plus size={22} color="#0F172A" weight="bold"/>
        </button>
      )}

      {/* Budget modal */}
      {showBudgetModal && (
        <Modal title={budget ? "Edit Budget" : "Set Budget"}
          onClose={() => { setShowBudgetModal(false); setBudgetInput(""); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>
                Amount ({currencySymbol})
              </label>
              <NumericInput value={budgetInput} onChange={e=>setBudgetInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter")handleSetBudget(); }}
                placeholder="0.00" autoFocus className="wf-input wf-input-data"/>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowBudgetModal(false); setBudgetInput(""); }} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSetBudget} disabled={!budgetInput.trim()} className="wf-btn-primary flex-1 py-2.5">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Item modal */}
      {showItemModal && (
        <Modal title={editingId ? "Edit Expense" : "Add Expense"} onClose={closeItemModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Item</label>
              <input type="text" value={itemName} onChange={e=>setItemName(e.target.value)}
                placeholder="e.g. Groceries" autoFocus className="wf-input"/>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>
                Amount ({currencySymbol})
              </label>
              <NumericInput value={itemAmount} onChange={e=>setItemAmount(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter")handleAddItem(); }}
                placeholder="0.00" className="wf-input wf-input-data"/>
            </div>
            {editingId && (
              <div className="flex flex-col gap-1 pt-1">
                <button onClick={() => { togglePaid(editingId); closeItemModal(); }}
                  className="text-xs font-semibold py-2 transition-opacity hover:opacity-70 text-left"
                  style={{ color:"var(--wf-cyan)" }}>
                  {expenses.find(e=>e.id===editingId)?.paid ? "Mark as unpaid" : "Mark as paid ✓"}
                </button>
                <button onClick={() => { deleteExpense(editingId); closeItemModal(); }}
                  className="text-xs font-semibold py-2 transition-opacity hover:opacity-70 text-left"
                  style={{ color:"var(--wf-pink)" }}>
                  Delete this item
                </button>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={closeItemModal} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleAddItem} disabled={!itemName.trim()||!itemAmount.trim()}
                className="wf-btn-primary flex-1 py-2.5">{editingId?"Update":"Add"}</button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title={`Delete "${period?.label}"?`}
          message="This will permanently remove this period and all its expenses."
          confirmLabel="Delete" danger isDark={true}
          onConfirm={() => { deletePeriod(id); router.replace("/budget-tracker"); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
