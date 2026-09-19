"use client";

import "../budget.css";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PiggyBank, Plus, ArrowRight, AirplaneTilt, House, ShieldCheck, Star, Sparkle } from "@phosphor-icons/react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import {
  useSavings, useSavingsDeposits, calcSavingsMetrics,
  type SavingsGoal, type GoalStatus,
} from "@/hooks/useSavingsStore";
import BudgetShell from "@/components/budget/BudgetShell";
import Modal from "@/components/budget/Modal";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GOAL_COLORS = ["#EC4899","#10B981","#22D3EE","#F59E0B","#8B5CF6","#F97316","#06B6D4","#84CC16"];

const STATUS: Record<GoalStatus, { label: string; cls: string }> = {
  achieved:   { label:"Goal Met",    cls:"wf-badge-emerald" },
  "on-track": { label:"On Track",    cls:"wf-badge-cyan" },
  behind:     { label:"Behind",      cls:"wf-badge-pink" },
  "no-date":  { label:"In Progress", cls:"wf-badge-muted" },
};

function GoalIcon({ name, color }: { name: string; color: string }) {
  const n = name.toLowerCase();
  const sz = 18;
  if (n.includes("trip")||n.includes("travel")||n.includes("vacation"))
    return <AirplaneTilt size={sz} color={color} weight="fill"/>;
  if (n.includes("home")||n.includes("house")||n.includes("down"))
    return <House size={sz} color={color} weight="fill"/>;
  if (n.includes("emergency")||n.includes("safety")||n.includes("fund"))
    return <ShieldCheck size={sz} color={color} weight="fill"/>;
  return <Star size={sz} color={color} weight="fill"/>;
}

function GlassTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(15,23,42,0.92)", backdropFilter:"blur(8px)",
      border:"1px solid rgba(255,255,255,0.10)", borderRadius:12, padding:"10px 14px" }}>
      {payload.map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color:"var(--wf-text)" }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:item.payload?.fill, flexShrink:0 }}/>
          <span style={{ fontSize:"0.75rem" }}>{item.name}: <strong>{item.value?.toFixed(1)}%</strong></span>
        </div>
      ))}
    </div>
  );
}

export default function SavingsHome() {
  return <BudgetShell><SavingsHomeInner /></BudgetShell>;
}

function SavingsHomeInner() {
  const router = useRouter();
  const { currencySymbol } = useBudgetSettingsCtx();
  const { goals, addGoal } = useSavings();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name:"", targetAmount:"", currentAmount:"0", targetDate:"", monthlyContribution:"",
  });

  const resetForm = () => setForm({ name:"", targetAmount:"", currentAmount:"0", targetDate:"", monthlyContribution:"" });

  const handleAdd = () => {
    const target  = parseNumeric(form.targetAmount);
    const current = parseNumeric(form.currentAmount) || 0;
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    const goal = addGoal({
      name: form.name.trim(), targetAmount: target, currentAmount: current,
      targetDate: form.targetDate || undefined,
      monthlyContribution: form.monthlyContribution ? parseNumeric(form.monthlyContribution) : undefined,
    });
    resetForm(); setShowAdd(false);
    router.push(`/budget-tracker/savings/${goal.id}`);
  };

  const fp = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  // Aggregate
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
  const pctOverall  = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  const pieData = goals.map((g, i) => ({
    name: g.name, fill: GOAL_COLORS[i % GOAL_COLORS.length],
    value: totalTarget > 0 ? parseFloat(((g.targetAmount / totalTarget) * 100).toFixed(1)) : 0,
  }));

  // Smart allocation
  const [availBalance, setAvailBalance] = useState("");
  const nonAchieved = goals.filter(g => g.currentAmount < g.targetAmount);
  const allocation = useMemo(() => {
    const bal = parseNumeric(availBalance);
    if (isNaN(bal) || bal <= 0 || nonAchieved.length === 0) return [];
    const totalRem = nonAchieved.reduce((s, g) => s + (g.targetAmount - g.currentAmount), 0);
    return nonAchieved.map((g, i) => ({
      goal: g, color: GOAL_COLORS[i % GOAL_COLORS.length],
      amount: bal * ((g.targetAmount - g.currentAmount) / totalRem),
    }));
  }, [availBalance, nonAchieved]);

  return (
    <div className="px-6 pt-6 pb-24 mx-auto" style={{ maxWidth:1200 }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color:"#22D3EE" }}>Finance</p>
            <h1 className="font-bold text-2xl tracking-tight" style={{ color:"var(--wf-text)" }}>
              Savings Goals
              {goals.length > 0 && (
                <span className="text-base font-normal ml-3" style={{ color:"var(--wf-muted)" }}>
                  {pctOverall.toFixed(0)}% to total target
                </span>
              )}
            </h1>
          </div>
          <motion.button onClick={() => setShowAdd(true)} className="wf-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <Plus size={14} weight="bold"/> Add Goal
          </motion.button>
        </div>
      </motion.div>

      {goals.length === 0 ? (
        <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
          className="wf-glass flex flex-col items-center justify-center py-24 px-8 text-center"
          style={{ borderStyle:"dashed" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background:"rgba(34,211,238,0.12)", border:"1px solid rgba(34,211,238,0.20)" }}>
            <PiggyBank size={28} color="#22D3EE" weight="fill"/>
          </div>
          <p className="font-bold text-lg mb-2" style={{ color:"var(--wf-text)" }}>No savings goals yet</p>
          <p className="text-sm mb-8" style={{ color:"var(--wf-muted)" }}>Create your first goal and start saving toward it.</p>
          <motion.button onClick={() => setShowAdd(true)} className="wf-btn-primary flex items-center gap-2 px-6 py-3"
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <Plus size={15} weight="bold"/> Add Goal
          </motion.button>
        </motion.div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20 }}>

          {/* Left: goal cards */}
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16, marginBottom:16 }}>
              <AnimatePresence>
                {goals.map((goal, i) => (
                  <GoalCard key={goal.id} goal={goal} color={GOAL_COLORS[i%GOAL_COLORS.length]}
                    sym={currencySymbol} index={i}
                    onClick={() => router.push(`/budget-tracker/savings/${goal.id}`)}/>
                ))}
              </AnimatePresence>
              <motion.button onClick={() => setShowAdd(true)}
                className="wf-glass flex flex-col items-center justify-center py-10"
                style={{ borderStyle:"dashed", minHeight:140, color:"#475569" }}
                whileHover={{ scale:1.02 }} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <Plus size={22} className="mb-2"/> <span className="text-sm font-medium">Create New Goal</span>
              </motion.button>
            </div>
          </div>

          {/* Right: allocation + smart */}
          <div className="flex flex-col gap-4">
            {/* Donut */}
            <motion.div className="wf-glass p-5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
              <p className="font-semibold text-sm mb-0.5" style={{ color:"var(--wf-text)" }}>Current Allocation</p>
              <p className="text-xs mb-3" style={{ color:"var(--wf-muted)" }}>How your savings are distributed</p>
              <div style={{ width:"100%", height:210, minHeight:210 }}>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                      paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
                    </Pie>
                    <Tooltip content={<GlassTooltip/>}/>
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:"10px", color:"var(--wf-muted)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Smart allocation */}
            <motion.div className="wf-glass p-5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkle size={16} color="#8B5CF6" weight="fill"/>
                <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>Smart Allocation</p>
              </div>
              <div className="rounded-xl p-3 mb-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs mb-2" style={{ color:"var(--wf-muted)" }}>Available balance to allocate:</p>
                <NumericInput value={availBalance} onChange={e=>setAvailBalance(e.target.value)}
                  placeholder={`${currencySymbol}0.00`} className="wf-input wf-input-data"/>
              </div>
              {allocation.length > 0 ? (
                <>
                  <p className="text-xs mb-3" style={{ color:"var(--wf-muted)" }}>
                    Based on {currencySymbol}{parseNumeric(availBalance).toLocaleString()}, we recommend:
                  </p>
                  <div className="space-y-2 mb-4">
                    {allocation.map(item => (
                      <div key={item.goal.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background:item.color, flexShrink:0 }}/>
                          <span className="text-xs font-medium" style={{ color:"var(--wf-text)" }}>{item.goal.name}</span>
                        </div>
                        <span className="wf-data text-xs font-bold" style={{ color:"#10B981" }}>
                          +{currencySymbol}{fmt(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="wf-btn-primary w-full py-2.5 text-sm font-bold">Apply Allocation</button>
                </>
              ) : (
                <p className="text-xs" style={{ color:"var(--wf-muted)" }}>
                  Enter an available balance above to get a recommended split.
                </p>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAdd && (
        <Modal title="Create New Goal" onClose={() => { setShowAdd(false); resetForm(); }}>
          <div className="space-y-4">
            {[
              { label:"Goal Name", el:<input type="text" {...fp("name")} placeholder="e.g. Emergency Fund" autoFocus className="wf-input" onKeyDown={e=>{if(e.key==="Enter")handleAdd();}}/> },
              { label:`Target Amount (${currencySymbol})`, el:<NumericInput {...fp("targetAmount")} placeholder="0.00" className="wf-input wf-input-data"/> },
              { label:`Already Saved (${currencySymbol})`, el:<NumericInput {...fp("currentAmount")} placeholder="0.00" className="wf-input wf-input-data"/> },
              { label:"Target Date (optional)", el:<input type="date" {...fp("targetDate")} className="wf-input"/> },
              { label:`Monthly Contribution (${currencySymbol}, optional)`, el:<NumericInput {...fp("monthlyContribution")} placeholder="0.00" className="wf-input wf-input-data"/> },
            ].map(({ label, el }) => (
              <div key={label}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>{label}</label>
                {el}
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name.trim()||!form.targetAmount}
                className="wf-btn-primary flex-1 py-2.5">Add Goal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function GoalCard({ goal, color, sym, onClick, index }: {
  goal: SavingsGoal; color: string; sym: string;
  onClick: () => void; index: number;
}) {
  const { deposits } = useSavingsDeposits(goal.id);
  const m = calcSavingsMetrics(goal, deposits);
  const s = STATUS[m.status];

  const progressClass = m.status === "achieved" ? "wf-progress-fill-emerald"
    : m.status === "behind" ? "wf-progress-fill-pink"
    : "wf-progress-fill";

  return (
    <motion.button onClick={onClick}
      className="wf-glass w-full text-left p-5 relative overflow-hidden group"
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale:1.015 }}>

      <div style={{
        position:"absolute", top:0, right:0, width:"60%", height:"100%",
        background:`radial-gradient(180px circle at 100% 0%, ${color}14, transparent 70%)`,
        pointerEvents:"none",
      }}/>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${color}20`, border:`1px solid ${color}30` }}>
              <GoalIcon name={goal.name} color={color}/>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color:"var(--wf-text)" }}>{goal.name}</p>
              <p className="wf-data text-xs mt-0.5" style={{ color:"var(--wf-muted)" }}>
                {sym}{fmt(m.totalSaved)} / {sym}{fmt(goal.targetAmount)}
              </p>
            </div>
          </div>
          <ArrowRight size={14} color="#475569"
            className="transition-transform group-hover:translate-x-0.5 flex-shrink-0 mt-1"/>
        </div>

        <div className="wf-progress-track mb-2">
          <div className={`wf-progress-fill ${progressClass}`} style={{ width:`${m.pctComplete}%` }}/>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color }}>{m.pctComplete.toFixed(0)}% reached</span>
          <span className={`wf-badge ${s.cls}`}>{s.label}</span>
        </div>

        {m.projectedDate && m.status !== "achieved" && (
          <p className="text-xs mt-2" style={{ color:"var(--wf-muted)" }}>
            Projected:{" "}
            <span style={{ color }}>
              {m.projectedDate.toLocaleDateString(undefined,{month:"short",year:"numeric"})}
            </span>
          </p>
        )}
      </div>
    </motion.button>
  );
}
