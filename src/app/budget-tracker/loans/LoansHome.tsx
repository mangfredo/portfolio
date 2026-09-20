"use client";

import "../budget.css";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Plus, ArrowRight, ChartLine, TrendDown } from "@phosphor-icons/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import {
  useLoans, useLoanPayments, calcLoanMetrics, monthlyOutflow,
  type Loan, type PaymentFrequency,
} from "@/hooks/useLoanStore";
import BudgetShell from "@/components/budget/BudgetShell";
import Modal from "@/components/budget/Modal";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function amortMonths(balance: number, monthlyRate: number, pmt: number): number {
  if (pmt <= balance * monthlyRate) return Infinity;
  return Math.ceil(Math.log(pmt / (pmt - balance * monthlyRate)) / Math.log(1 + monthlyRate));
}

function buildProjectionData(loan: Loan) {
  const r = loan.interestRate / 100 / 12;
  const pmt = monthlyOutflow(loan);
  let bal = loan.principal;
  let cumInt = 0;
  const data: { month: number; principal: number; interest: number }[] = [
    { month: 0, principal: Math.round(bal), interest: 0 }
  ];
  for (let m = 1; m <= 360 && bal > 0.01; m++) {
    const intCharge = bal * r;
    const prinPaid  = Math.min(pmt - intCharge, bal);
    cumInt += intCharge;
    bal    -= prinPaid;
    data.push({ month: m, principal: Math.round(Math.max(bal, 0)), interest: Math.round(cumInt) });
  }
  return data;
}

function GlassTooltip({ active, payload, label, sym = "" }: {
  active?: boolean; payload?: Array<{ value: number; color?: string; name?: string }>;
  label?: string; sym?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(15,23,42,0.92)", backdropFilter:"blur(8px)",
      border:"1px solid rgba(255,255,255,0.10)", borderRadius:12, padding:"12px 16px", minWidth:150 }}>
      <p style={{ color:"var(--wf-muted)", fontSize:"0.75rem", marginBottom:8 }}>Month {label}</p>
      {payload.map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color:"var(--wf-text)", marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:item.color, flexShrink:0 }} />
          <span style={{ flex:1, fontSize:"0.75rem" }}>{item.name}:</span>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.75rem", fontWeight:700 }}>
            {sym}{fmt(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LoansHome() {
  return <BudgetShell><LoansHomeInner /></BudgetShell>;
}

function LoansHomeInner() {
  const router = useRouter();
  const { currencySymbol } = useBudgetSettingsCtx();
  const { loans, addLoan } = useLoans();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name:"", principal:"", interestRate:"", monthlyPayment:"",
    paymentFrequency:"monthly" as PaymentFrequency,
    startDate: new Date().toISOString().slice(0,10),
    extra:"0",
  });

  const reset = () => setForm({
    name:"", principal:"", interestRate:"", monthlyPayment:"",
    paymentFrequency:"monthly", startDate:new Date().toISOString().slice(0,10), extra:"0",
  });

  const handleAdd = () => {
    const p = parseNumeric(form.principal);
    const r = parseNumeric(form.interestRate);
    const m = parseNumeric(form.monthlyPayment);
    if (!form.name.trim() || isNaN(p) || isNaN(r) || isNaN(m)) return;
    const loan = addLoan({ name:form.name.trim(), principal:p, interestRate:r,
      monthlyPayment:m, paymentFrequency:form.paymentFrequency, startDate:form.startDate });
    reset(); setShowAdd(false);
    setSelectedLoanId(loan.id);
  };

  const fp = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  // Projection loan
  const projLoan: Loan | null = useMemo(() => {
    if (selectedLoanId) return loans.find(l => l.id === selectedLoanId) ?? null;
    const p = parseNumeric(form.principal);
    const r = parseNumeric(form.interestRate);
    const m = parseNumeric(form.monthlyPayment);
    if (p > 0 && r > 0 && m > 0) {
      return { id:"__preview__", name:form.name||"Preview",
        principal:p, interestRate:r, monthlyPayment:m,
        paymentFrequency:form.paymentFrequency, startDate:form.startDate,
        createdAt:new Date().toISOString() };
    }
    return null;
  }, [selectedLoanId, loans, form]);

  const extra = parseNumeric(form.extra) || 0;
  const projData = useMemo(() => projLoan ? buildProjectionData(projLoan) : [], [projLoan]);
  const accelData = useMemo(() => {
    if (!projLoan || extra <= 0) return [];
    return buildProjectionData({ ...projLoan, monthlyPayment: projLoan.monthlyPayment + extra });
  }, [projLoan, extra]);

  const metrics = useMemo(() => {
    if (!projLoan) return null;
    const r = projLoan.interestRate / 100 / 12;
    const pmt = monthlyOutflow(projLoan);
    const months = amortMonths(projLoan.principal, r, pmt);
    const totalInt = isFinite(months) ? pmt * months - projLoan.principal : 0;
    const payoff = isFinite(months) ? (() => { const d = new Date(); d.setMonth(d.getMonth()+months); return d; })() : null;
    const accelPmt = pmt + extra;
    const accelMonths = extra > 0 ? amortMonths(projLoan.principal, r, accelPmt) : months;
    const accelInt = isFinite(accelMonths) ? accelPmt*accelMonths - projLoan.principal : totalInt;
    return { pmt, months, totalInt, payoff,
      saved: Math.max(0, totalInt - accelInt),
      timeSaved: isFinite(months) && isFinite(accelMonths) ? Math.max(0, months - accelMonths) : 0 };
  }, [projLoan, extra]);

  const inputStyle: React.CSSProperties = {
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)",
    borderRadius:10, color:"var(--wf-text)", fontSize:"0.875rem", padding:"10px 14px", width:"100%", outline:"none",
  };

  return (
    <div className="px-6 pt-6 pb-24 mx-auto" style={{ maxWidth:1200 }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color:"var(--wf-cyan)" }}>Finance</p>
        <h1 className="font-bold text-2xl tracking-tight" style={{ color:"var(--wf-text)" }}>Loan Repayment</h1>
      </motion.div>

      {/* Main 2-col */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20, marginBottom:20 }}>
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Calculator card */}
          <motion.div className="wf-glass p-5" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background:"var(--wf-cyan-dim)" }}>
                <CreditCard size={16} color="var(--wf-cyan)" weight="fill" />
              </div>
              <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>Repayment Calculator</p>
            </div>

            {/* Loan selector chips */}
            {loans.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setSelectedLoanId(null)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                  style={{
                    background: selectedLoanId === null ? "var(--wf-cyan)" : "rgba(255,255,255,0.06)",
                    color: selectedLoanId === null ? "#0F172A" : "#94A3B8",
                    border:"1px solid rgba(255,255,255,0.10)",
                  }}>Custom</button>
                {loans.map(l => (
                  <button key={l.id} onClick={() => setSelectedLoanId(l.id)}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                    style={{
                      background: selectedLoanId === l.id ? "var(--wf-cyan)" : "rgba(255,255,255,0.06)",
                      color: selectedLoanId === l.id ? "#0F172A" : "#94A3B8",
                      border:"1px solid rgba(255,255,255,0.10)",
                    }}>{l.name}</button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {[
                { label:"Loan Name", el: <input value={selectedLoanId ? (loans.find(l=>l.id===selectedLoanId)?.name??"") : form.name}
                    onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Personal Loan"
                    disabled={selectedLoanId!==null} style={inputStyle}/> },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:"var(--wf-muted)" }}>{label}</label>
                  {el}
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:"var(--wf-muted)" }}>Principal Amount</label>
                <NumericInput
                  value={selectedLoanId ? String(loans.find(l=>l.id===selectedLoanId)?.principal??"") : form.principal}
                  onChange={e=>setForm(f=>({...f,principal:e.target.value}))}
                  placeholder={`${currencySymbol}25,000`} style={inputStyle}
                  disabled={selectedLoanId!==null} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:"var(--wf-muted)" }}>Interest Rate</label>
                  <NumericInput value={selectedLoanId ? String(loans.find(l=>l.id===selectedLoanId)?.interestRate??"") : form.interestRate}
                    onChange={e=>setForm(f=>({...f,interestRate:e.target.value}))}
                    placeholder="6.5%" style={inputStyle} disabled={selectedLoanId!==null}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:"var(--wf-muted)" }}>Monthly Pmt</label>
                  <NumericInput value={selectedLoanId ? String(loans.find(l=>l.id===selectedLoanId)?.monthlyPayment??"") : form.monthlyPayment}
                    onChange={e=>setForm(f=>({...f,monthlyPayment:e.target.value}))}
                    placeholder={`${currencySymbol}489`} style={inputStyle} disabled={selectedLoanId!==null}/>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(true)} className="wf-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                <Plus size={12} weight="bold" /> Add Loan
              </button>
              {selectedLoanId && (
                <button onClick={() => router.push(`/budget-tracker/loans/${selectedLoanId}`)}
                  className="wf-btn-ghost px-3 py-2 text-xs">View →</button>
              )}
            </div>
          </motion.div>

          {/* Accelerate card */}
          <motion.div className="wf-glass p-5" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background:"rgba(16,185,129,0.12)" }}>
                <TrendDown size={16} color="var(--wf-emerald)" weight="fill" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>Accelerate Payoff</p>
                <p className="text-xs" style={{ color:"var(--wf-muted)" }}>See how extra payments reduce interest and time.</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--wf-muted)" }}>Monthly Extra</span>
                <span className="text-sm font-bold" style={{ color:"var(--wf-emerald)" }}>
                  +{currencySymbol}{(parseNumeric(form.extra)||0).toLocaleString(undefined,{maximumFractionDigits:0})}
                </span>
              </div>
              <input type="range" min={0}
                max={projLoan ? Math.round(monthlyOutflow(projLoan) * 2) : 1000}
                step={50} value={parseNumeric(form.extra)||0}
                onChange={e=>setForm(f=>({...f,extra:e.target.value}))}
                style={{ width:"100%", accentColor:"var(--wf-emerald)" } as React.CSSProperties}/>
            </div>
            {metrics && extra > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="rounded-xl p-3" style={{ background:"rgba(16,185,129,0.10)", border:"1px solid rgba(16,185,129,0.20)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color:"var(--wf-muted)" }}>Saved</p>
                  <p className="wf-data text-sm font-bold" style={{ color:"var(--wf-emerald)" }}>{currencySymbol}{fmt(metrics.saved)}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background:"rgba(34,211,238,0.10)", border:"1px solid rgba(56,189,248,0.20)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color:"var(--wf-muted)" }}>Time Saved</p>
                  <p className="wf-data text-sm font-bold" style={{ color:"var(--wf-cyan)" }}>{metrics.timeSaved} mo</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Chart */}
        <motion.div className="wf-glass p-5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
          <div className="flex items-center gap-2 mb-4">
            <ChartLine size={16} color="var(--wf-cyan)" />
            <div>
              <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>Repayment Projection</p>
              <p className="text-xs" style={{ color:"var(--wf-muted)" }}>Principal vs Interest over lifecycle</p>
            </div>
          </div>
          {projData.length > 1 ? (
            <div style={{ width:"100%", height:300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projData.map((d,i) => ({ ...d, accelPrincipal: accelData[i]?.principal }))}
                  margin={{ top:4, right:8, left:0, bottom:16 }}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false}
                    label={{ value:"Months", position:"insideBottom", offset:-8, fontSize:10, fill:"#94A3B8" }}/>
                  <YAxis tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false}
                    tickFormatter={v=>`${currencySymbol}${(v/1000).toFixed(0)}k`} width={48}/>
                  <Tooltip content={<GlassTooltip sym={currencySymbol}/>}/>
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:"11px", paddingTop:8 }}/>
                  <Line type="monotone" dataKey="principal" name="Principal" stroke="var(--wf-cyan)" strokeWidth={2} dot={false} activeDot={{ r:4 }}/>
                  <Line type="monotone" dataKey="interest" name="Interest" stroke="var(--wf-pink)" strokeWidth={2} dot={false} activeDot={{ r:4 }}/>
                  {accelData.length > 0 && (
                    <Line type="monotone" dataKey="accelPrincipal" name="Accel. Principal" stroke="var(--wf-emerald)" strokeWidth={1.5} strokeDasharray="4 3" dot={false}/>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height:300 }} className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background:"rgba(34,211,238,0.10)" }}>
                <ChartLine size={22} color="var(--wf-cyan)" />
              </div>
              <p className="text-sm text-center" style={{ color:"var(--wf-muted)" }}>
                Fill in loan details on the left to see the projection.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Metric cards */}
      {metrics && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:24 }}>
          {[
            { label:"Monthly Payment", value:`${currencySymbol}${fmt(metrics.pmt)}`, color:"var(--wf-text)" },
            { label:"Total Interest",  value:`${currencySymbol}${fmt(metrics.totalInt)}`, color:"var(--wf-pink)" },
            { label:"Payoff Date", value: metrics.payoff ? metrics.payoff.toLocaleDateString(undefined,{month:"short",year:"numeric"}) : "—", color:"var(--wf-cyan)" },
          ].map(({ label, value, color }, i) => (
            <motion.div key={label} className="wf-glass p-4"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>{label}</p>
              <p className="wf-data text-xl font-bold" style={{ color }}>{value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loan cards */}
      {loans.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:"var(--wf-muted)" }}>Your Loans</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
            {loans.map((loan, i) => (
              <LoanCard key={loan.id} loan={loan} sym={currencySymbol}
                isSelected={selectedLoanId===loan.id}
                onSelect={() => setSelectedLoanId(loan.id===selectedLoanId?null:loan.id)}
                onDetail={() => router.push(`/budget-tracker/loans/${loan.id}`)}
                index={i}/>
            ))}
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      {showAdd && (
        <Modal title="Add Loan" onClose={() => { setShowAdd(false); reset(); }}>
          <div className="space-y-4">
            {[
              { label:"Loan Name", el:<input type="text" {...fp("name")} placeholder="e.g. Car Loan" autoFocus className="wf-input" onKeyDown={e=>{if(e.key==="Enter")handleAdd();}}/> },
              { label:`Principal (${currencySymbol})`, el:<NumericInput {...fp("principal")} placeholder="0.00" className="wf-input wf-input-data"/> },
              { label:"Annual Interest (%)", el:<NumericInput {...fp("interestRate")} placeholder="6.5" className="wf-input wf-input-data"/> },
            ].map(({ label, el }) => (
              <div key={label}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>{label}</label>
                {el}
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Payment ({currencySymbol})</label>
                <NumericInput {...fp("monthlyPayment")} placeholder="0.00" className="wf-input wf-input-data"/>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Frequency</label>
                <select {...fp("paymentFrequency")} className="wf-input" style={{ cursor:"pointer" }}>
                  <option value="monthly" style={{ background:"#1E293B" }}>Once/month</option>
                  <option value="twice-monthly" style={{ background:"#1E293B" }}>Twice/month</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Start Date</label>
              <input type="date" {...fp("startDate")} className="wf-input"/>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowAdd(false); reset(); }} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleAdd}
                disabled={!form.name.trim()||!form.principal||!form.interestRate||!form.monthlyPayment}
                className="wf-btn-primary flex-1 py-2.5">Add Loan</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoanCard({ loan, sym, isSelected, onSelect, onDetail, index }: {
  loan: Loan; sym: string; isSelected: boolean;
  onSelect: () => void; onDetail: () => void; index: number;
}) {
  const { payments } = useLoanPayments(loan.id);
  const m = calcLoanMetrics(loan, payments);
  const pct = m.pctPaid;
  const progressColor = pct >= 100 ? "wf-progress-fill-emerald"
    : pct > 50 ? "wf-progress-fill"
    : "wf-progress-fill-warn";

  return (
    <motion.div
      className="wf-glass p-4 cursor-pointer"
      style={{ border: isSelected ? "1.5px solid #22D3EE" : undefined }}
      onClick={onSelect}
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:index*0.05 }}
      whileHover={{ scale:1.015 }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="font-semibold text-sm" style={{ color:"var(--wf-text)" }}>{loan.name}</p>
        <button onClick={e=>{ e.stopPropagation(); onDetail(); }}
          className="text-xs font-semibold flex items-center gap-1" style={{ color:"var(--wf-cyan)" }}>
          Detail <ArrowRight size={11}/>
        </button>
      </div>
      <p className="wf-data text-xs mb-3" style={{ color:"var(--wf-muted)" }}>
        {sym}{fmt(m.currentBalance)} remaining
      </p>
      <div className="wf-progress-track mb-2">
        <div className={`wf-progress-fill ${progressColor}`} style={{ width:`${pct}%` }}/>
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color:"var(--wf-muted)" }}>{pct.toFixed(1)}% paid</span>
        <span className="wf-data" style={{ color:"var(--wf-muted)" }}>{sym}{fmt(loan.monthlyPayment)}/mo</span>
      </div>
    </motion.div>
  );
}
