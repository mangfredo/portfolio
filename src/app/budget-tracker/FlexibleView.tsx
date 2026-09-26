"use client";

import "./budget.css";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CaretDown, CaretRight, Wallet, DotsSixVertical } from "@phosphor-icons/react";
import { usePeriods, useExpenses, useGigs, useGigItems, type Period, type Expense, type Gig } from "@/hooks/useBudgetStore";
import { useBudgetSettingsCtx } from "@/context/BudgetSettingsContext";
import Modal from "@/components/budget/Modal";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthKey(key: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

// ── Context menu component ────────────────────────────────────────────────

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

function ContextMenu({
  x, y, items, onClose,
}: { x: number; y: number; items: ContextMenuItem[]; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const closeKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeKey);
    };
  }, [onClose]);

  // Adjust position if near edge
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 40 - 16);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: adjustedX,
        top: adjustedY,
        zIndex: 9999,
        background: "#1E293B",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "4px 0",
        minWidth: 160,
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
        fontFamily: "var(--font-outfit, system-ui)",
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.onClick();
            // Defer close so action state updates can render first
            setTimeout(onClose, 0);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "8px 14px", textAlign: "left",
            background: "none", border: "none", cursor: "pointer",
            color: item.danger ? "#F43F5E" : "#F1F5F9",
            fontSize: "0.875rem", fontWeight: 500,
            transition: "background 100ms ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = item.danger ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.07)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
        >
          {item.icon && <span style={{ opacity: 0.7, display:"flex", alignItems:"center" }}>{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── Period accordion (one entry) ──────────────────────────────────────────

function PeriodAccordion({
  period, isOpen, isChecked, onToggleOpen, onToggleCheck, currencySymbol,
  onDragStart, onDragOver, onDrop, isDraggingOver, onContextMenu,
}: {
  period: Period;
  isOpen: boolean;
  isChecked: boolean;
  onToggleOpen: () => void;
  onToggleCheck: () => void;
  currencySymbol: string;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isDraggingOver?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const { expenses, addExpense, updateExpense, deleteExpense, togglePaid, s1Expenses, bufferExpenses, s1Total, bufferAllocated } = useExpenses(period.id);
  const { periods, updateBudget, updatePeriodMeta } = usePeriods();

  const budget = period.budget;
  const bufferAmount = Math.max(budget - s1Total, 0);
  const bufferRemaining = bufferAmount - bufferAllocated;

  const s1Label = period.section1Label ?? "Avg spending";
  const bufLabel = period.bufferLabel ?? "Buffer";

  // Add item modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addSection, setAddSection] = useState<"s1" | "buffer">("s1");
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Budget edit
  const [showBudget, setShowBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // Section label editing
  const [editingLabel, setEditingLabel] = useState<"s1" | "buffer" | null>(null);
  const [labelInput, setLabelInput] = useState("");

  const openAdd = (section: "s1" | "buffer") => {
    setAddSection(section);
    setItemName(""); setItemAmount(""); setEditingId(null);
    setShowAdd(true);
  };

  const openEdit = (e: Expense) => {
    setItemName(e.name); setItemAmount(String(e.amount));
    setEditingId(e.id);
    setAddSection((e.sectionKey ?? "s1") as "s1" | "buffer");
    setShowAdd(true);
  };

  const handleSaveItem = () => {
    const name = itemName.trim();
    const amount = parseNumeric(itemAmount);
    if (!name || isNaN(amount) || amount < 0) return;
    if (editingId) {
      updateExpense(editingId, name, amount);
      setEditingId(null);
    } else {
      addExpense(name, amount, addSection);
    }
    setItemName(""); setItemAmount(""); setShowAdd(false);
  };

  const handleSaveBudget = () => {
    const val = parseNumeric(budgetInput);
    if (isNaN(val) || val < 0) return;
    updateBudget(period.id, val);
    setShowBudget(false);
  };

  const startLabelEdit = (which: "s1" | "buffer") => {
    setEditingLabel(which);
    setLabelInput(which === "s1" ? s1Label : bufLabel);
  };

  const saveLabelEdit = () => {
    if (!editingLabel || !labelInput.trim()) { setEditingLabel(null); return; }
    updatePeriodMeta(period.id, editingLabel === "s1"
      ? { section1Label: labelInput.trim() }
      : { bufferLabel: labelInput.trim() }
    );
    setEditingLabel(null);
  };

  const isDark = true; // Flexible view always uses the current theme via CSS vars
  const textMain = "var(--wf-text)";
  const textMuted = "var(--wf-muted)";

  return (
    <>
      {/* Collapsed header row */}
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu?.(e); }}
        className="fv-period-header"
        style={{
          padding:"12px 0", borderBottom:"1px solid var(--wf-border)",
          cursor:"default",
          background: isDraggingOver ? "rgba(34,211,238,0.06)" : "transparent",
          borderRadius: isDraggingOver ? 6 : 0,
          transition:"background 150ms ease",
        }}
      >
        {/* Drag handle */}
        <span
          style={{ color:"var(--wf-border)", cursor:"grab", flexShrink:0, display:"flex", alignItems:"center" }}
          title="Drag to reorder"
        >
          <DotsSixVertical size={16} />
        </span>
        {/* Checkbox */}
        <button
          onClick={onToggleCheck}
          style={{
            width:18, height:18, borderRadius:4, flexShrink:0, cursor:"pointer",
            background: isChecked ? "var(--wf-cyan)" : "transparent",
            border: `2px solid ${isChecked ? "var(--wf-cyan)" : "var(--wf-muted)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
          aria-label="Select period"
        >
          {isChecked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5L8.5 2" stroke="var(--wf-bg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Expand chevron + label */}
        <button
          onClick={onToggleOpen}
          style={{ display:"flex", alignItems:"center", gap:8, flex:1, textAlign:"left", background:"none", border:"none", cursor:"pointer", minWidth:0 }}
        >
          {isOpen
            ? <CaretDown size={14} color="var(--wf-muted)" />
            : <CaretRight size={14} color="var(--wf-muted)" />
          }
          <span style={{ fontSize:"0.9rem", fontWeight:600, color: textMain, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {period.label}
          </span>
        </button>

        {/* Stats — hidden when expanded */}
        <div className="fv-period-stats" style={{ display: isOpen ? "none" : undefined }}>
          <div style={{ textAlign:"right" }}>
            <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>Budget</p>
            <p className="wf-data" style={{ color: textMain, fontWeight:600 }}>
              {budget > 0 ? `${currencySymbol}${fmt(budget)}` : "—"}
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>{s1Label}</p>
            <p className="wf-data" style={{ color: s1Total > 0 ? "var(--wf-pink)" : textMuted, fontWeight:600 }}>
              {s1Total > 0 ? `${currencySymbol}${fmt(s1Total)}` : "—"}
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>Total</p>
            <p className="wf-data" style={{ color: (s1Total + bufferAllocated) > 0 ? "var(--wf-text)" : textMuted, fontWeight:600 }}>
              {(s1Total + bufferAllocated) > 0 ? `${currencySymbol}${fmt(s1Total + bufferAllocated)}` : "—"}
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>{bufLabel}</p>
            <p className="wf-data" style={{ color: bufferAmount > 0 ? "var(--wf-emerald)" : textMuted, fontWeight:700 }}>
              {budget > 0 ? `${currencySymbol}${fmt(bufferAmount)}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.2 }}
            style={{ overflow:"hidden" }}
          >
            <div style={{ paddingLeft:28, paddingBottom:16, paddingTop:8 }}>

              {/* Budget row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:"0.7rem", color: textMuted, textTransform:"uppercase", letterSpacing:"0.1em" }}>Expected Salary / Budget</p>
                  <p className="wf-data" style={{ fontSize:"1.25rem", fontWeight:700, color: textMain }}>
                    {budget > 0 ? `${currencySymbol}${fmt(budget)}` : "Not set"}
                  </p>
                </div>
                <button
                  onClick={() => { setBudgetInput(budget > 0 ? String(budget) : ""); setShowBudget(true); }}
                  style={{ fontSize:"0.75rem", color:"var(--wf-cyan)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}
                >
                  {budget > 0 ? "Edit" : "Set budget"}
                </button>
              </div>

              {/* Section 1 */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  {editingLabel === "s1" ? (
                    <input
                      value={labelInput}
                      onChange={e => setLabelInput(e.target.value)}
                      onBlur={saveLabelEdit}
                      onKeyDown={e => { if (e.key === "Enter") saveLabelEdit(); if (e.key === "Escape") setEditingLabel(null); }}
                      autoFocus
                      style={{
                        background:"var(--wf-surface-alt)", border:"1px solid var(--wf-cyan)",
                        borderRadius:6, color:"var(--wf-text)", fontSize:"0.8rem", fontWeight:700,
                        padding:"2px 8px", outline:"none",
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => startLabelEdit("s1")}
                      style={{ fontSize:"0.8rem", fontWeight:700, color: textMuted, background:"none", border:"none", cursor:"pointer", textDecoration:"underline dotted" }}
                      title="Click to rename"
                    >
                      {s1Label}
                    </button>
                  )}
                  <span style={{ fontSize:"0.75rem", color: textMuted }}>
                    {currencySymbol}{fmt(s1Total)}
                  </span>
                </div>

                {s1Expenses.map(e => (
                  <div key={e.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid var(--wf-border)", gap:8 }}>
                    <button
                      onClick={() => openEdit(e)}
                      style={{
                        textAlign:"left", background:"none", border:"none", cursor:"pointer", flex:1,
                        color: e.paid ? textMuted : textMain,
                        fontSize:"0.85rem",
                        textDecoration: e.paid ? "line-through" : "none",
                        opacity: e.paid ? 0.55 : 1,
                      }}
                    >
                      {e.name}
                    </button>
                    <button
                      onClick={() => togglePaid(e.id)}
                      title={e.paid ? "Mark as unpaid" : "Mark as paid"}
                      style={{
                        background:"none", cursor:"pointer", flexShrink:0,
                        fontSize:"0.65rem", fontWeight:600, padding:"2px 6px", borderRadius:4,
                        color: e.paid ? "var(--wf-emerald)" : textMuted,
                        border: `1px solid ${e.paid ? "rgba(16,185,129,0.4)" : "var(--wf-border)"}`,
                      }}
                    >
                      {e.paid ? "✓ Paid" : "Paid?"}
                    </button>
                    <span className="wf-data" style={{
                      color: e.paid ? textMuted : textMain,
                      fontSize:"0.85rem", fontWeight:600, flexShrink:0,
                      textDecoration: e.paid ? "line-through" : "none",
                      opacity: e.paid ? 0.55 : 1,
                    }}>
                      {currencySymbol}{fmt(e.amount)}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => openAdd("s1")}
                  style={{ marginTop:6, fontSize:"0.75rem", color:"var(--wf-cyan)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:600 }}
                >
                  <Plus size={12} weight="bold"/> Add item
                </button>
              </div>

              {/* Buffer divider */}
              <div style={{
                display:"flex", alignItems:"center", gap:10, margin:"12px 0 8px",
                padding:"8px 12px", borderRadius:8,
                background: bufferAmount > 0 ? "rgba(16,185,129,0.08)" : "var(--wf-surface-alt)",
                border: `1px solid ${bufferAmount > 0 ? "rgba(16,185,129,0.20)" : "var(--wf-border)"}`,
              }}>
                {editingLabel === "buffer" ? (
                  <input
                    value={labelInput}
                    onChange={e => setLabelInput(e.target.value)}
                    onBlur={saveLabelEdit}
                    onKeyDown={e => { if (e.key === "Enter") saveLabelEdit(); if (e.key === "Escape") setEditingLabel(null); }}
                    autoFocus
                    style={{
                      background:"transparent", border:"1px solid var(--wf-cyan)",
                      borderRadius:6, color:"var(--wf-text)", fontSize:"0.85rem", fontWeight:700,
                      padding:"2px 8px", outline:"none", flex:1,
                    }}
                  />
                ) : (
                  <button
                    onClick={() => startLabelEdit("buffer")}
                    style={{ fontSize:"0.85rem", fontWeight:700, color:"var(--wf-emerald)", background:"none", border:"none", cursor:"pointer", textDecoration:"underline dotted", flex:1, textAlign:"left" }}
                    title="Click to rename"
                  >
                    {bufLabel}
                  </button>
                )}
                <span className="wf-data" style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--wf-emerald)", flexShrink:0 }}>
                  {budget > 0 ? `${currencySymbol}${fmt(bufferAmount)}` : "—"}
                </span>
              </div>

              {/* Buffer items */}
              <div style={{ paddingLeft:8 }}>
                {bufferExpenses.map(e => (
                  <div key={e.id} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid var(--wf-border)" }}>
                    <button
                      onClick={() => openEdit(e)}
                      style={{ textAlign:"left", background:"none", border:"none", cursor:"pointer", color: textMain, fontSize:"0.85rem", flex:1 }}
                    >
                      {e.name}
                    </button>
                    <span className="wf-data" style={{ color: textMuted, fontSize:"0.85rem", flexShrink:0 }}>
                      {currencySymbol}{fmt(e.amount)}
                    </span>
                  </div>
                ))}

                {bufferExpenses.length > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", marginTop:2 }}>
                    <span style={{ fontSize:"0.75rem", color: textMuted }}>Remaining</span>
                    <span className="wf-data" style={{ fontSize:"0.85rem", fontWeight:700, color: bufferRemaining >= 0 ? "var(--wf-emerald)" : "var(--wf-pink)" }}>
                      {bufferRemaining >= 0 ? "" : "-"}{currencySymbol}{fmt(Math.abs(bufferRemaining))}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => openAdd("buffer")}
                  style={{ marginTop:4, fontSize:"0.75rem", color:"var(--wf-emerald)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:600 }}
                >
                  <Plus size={12} weight="bold"/> Add buffer item
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget modal */}
      {showBudget && (
        <Modal title="Set Budget" onClose={() => setShowBudget(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>
                Amount ({currencySymbol})
              </label>
              <NumericInput value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveBudget(); }}
                placeholder="0.00" autoFocus className="wf-input wf-input-data"/>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowBudget(false)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSaveBudget} disabled={!budgetInput.trim()} className="wf-btn-primary flex-1 py-2.5">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit item modal */}
      {showAdd && (
        <Modal title={editingId ? "Edit Item" : `Add ${addSection === "s1" ? s1Label : bufLabel} Item`} onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Item</label>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)}
                placeholder="e.g. Tithes" autoFocus className="wf-input"/>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Amount ({currencySymbol})</label>
              <NumericInput value={itemAmount} onChange={e => setItemAmount(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveItem(); }}
                placeholder="0.00" className="wf-input wf-input-data"/>
            </div>
            {editingId && (
              <button onClick={() => { deleteExpense(editingId); setEditingId(null); setShowAdd(false); }}
                style={{ color:"var(--wf-pink)", fontSize:"0.8rem", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                Delete this item
              </button>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAdd(false)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSaveItem} disabled={!itemName.trim() || !itemAmount.trim()} className="wf-btn-primary flex-1 py-2.5">
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Gig card (side income entry) ─────────────────────────────────────────

function GigCard({ gig, currencySymbol, onDelete }: {
  gig: Gig;
  currencySymbol: string;
  onDelete: (id: string) => void;
}) {
  const { items, addItem, updateItem, deleteItem, togglePaid, total } = useGigItems(gig.id);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Income edit — same pattern as period budget
  const [showIncome, setShowIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");

  const handleSaveIncome = () => {
    const val = parseNumeric(incomeInput);
    if (isNaN(val) || val < 0) return;
    updateGig(gig.id, { income: val });
    setShowIncome(false);
  };

  // Local context menu for gig label + gig items
  type GigCtx = { type: "gig" } | { type: "gigItem"; id: string };
  const [gigCtx, setGigCtx] = useState<{ x: number; y: number; target: GigCtx } | null>(null);
  const [renamingGig, setRenamingGig] = useState(false);
  const [renameGigInput, setRenameGigInput] = useState("");
  const { updateGig } = useGigs();

  const textMain = "var(--wf-text)";
  const textMuted = "var(--wf-muted)";
  const amber = "var(--wf-amber, #F59E0B)";
  const amberDim = "rgba(245,158,11,0.12)";
  const amberBorder = "rgba(245,158,11,0.25)";

  const remaining = gig.income > 0 ? gig.income - total : 0;

  const openEdit = (item: { id: string; name: string; amount: number }) => {
    setItemName(item.name);
    setItemAmount(String(item.amount));
    setEditingItemId(item.id);
    setShowAddItem(true);
  };

  const handleSaveItem = () => {
    const val = parseNumeric(itemAmount);
    if (!itemName.trim() || isNaN(val) || val < 0) return;
    if (editingItemId) {
      updateItem(editingItemId, itemName, val);
      setEditingItemId(null);
    } else {
      addItem(itemName, val);
    }
    setItemName(""); setItemAmount(""); setShowAddItem(false);
  };

  return (
    <>
      {/* Gig header row */}
      <div
        onContextMenu={(e) => { e.preventDefault(); setGigCtx({ x: e.clientX, y: e.clientY, target: { type:"gig" } }); }}
        style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"10px 0", borderBottom:"1px solid var(--wf-border)",
        cursor:"default",
      }}>
        {/* Amber tag */}
        <span style={{
          flexShrink:0, fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.08em",
          textTransform:"uppercase", padding:"2px 6px", borderRadius:4,
          background: amberDim, color: amber, border:`1px solid ${amberBorder}`,
        }}>GIG</span>

        {/* Toggle + label */}
        <button
          onClick={() => setIsOpen(o => !o)}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setGigCtx({ x: e.clientX, y: e.clientY, target: { type:"gig" } }); }}
          style={{ display:"flex", alignItems:"center", gap:8, flex:1, textAlign:"left", background:"none", border:"none", cursor:"pointer", minWidth:0 }}
        >
          {isOpen
            ? <CaretDown size={14} color={amber} />
            : <CaretRight size={14} color={amber} />
          }
          <span style={{ fontSize:"0.9rem", fontWeight:600, color: textMain, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {gig.label}
          </span>
        </button>

        {/* Stats — hidden when open */}
        {!isOpen && (
          <div className="fv-period-stats" style={{ fontSize:"0.75rem" }}>
            {gig.income > 0 && (
              <div style={{ textAlign:"right" }}>
                <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>Income</p>
                <p className="wf-data" style={{ color: amber, fontWeight:600 }}>{currencySymbol}{fmt(gig.income)}</p>
              </div>
            )}
            {items.length > 0 && (
              <div style={{ textAlign:"right" }}>
                <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>Spent</p>
                <p className="wf-data" style={{ color:"var(--wf-pink)", fontWeight:600 }}>{currencySymbol}{fmt(total)}</p>
              </div>
            )}
            {gig.income > 0 && items.length > 0 && (
              <div style={{ textAlign:"right" }}>
                <p style={{ color: textMuted, fontSize:"0.65rem", marginBottom:1 }}>Left</p>
                <p className="wf-data" style={{ color: remaining >= 0 ? "var(--wf-emerald)" : "var(--wf-pink)", fontWeight:700 }}>
                  {remaining < 0 ? "-" : ""}{currencySymbol}{fmt(Math.abs(remaining))}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.2 }}
            style={{ overflow:"hidden" }}
          >
            <div style={{ paddingLeft:28, paddingBottom:12, paddingTop:8 }}>
              {/* Income header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10,
                padding:"8px 12px", borderRadius:8, background: amberDim, border:`1px solid ${amberBorder}` }}>
                <div>
                  <p style={{ fontSize:"0.65rem", color: textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>Expected Income</p>
                  <p className="wf-data" style={{ fontSize:"1.1rem", fontWeight:700, color: amber }}>
                    {gig.income > 0 ? `${currencySymbol}${fmt(gig.income)}` : "Not set"}
                  </p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  {gig.income > 0 && items.length > 0 && (
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:"0.65rem", color: textMuted, marginBottom:2 }}>Remaining</p>
                      <p className="wf-data" style={{ fontSize:"1rem", fontWeight:700,
                        color: remaining >= 0 ? "var(--wf-emerald)" : "var(--wf-pink)" }}>
                        {remaining < 0 ? "-" : ""}{currencySymbol}{fmt(Math.abs(remaining))}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => { setIncomeInput(gig.income > 0 ? String(gig.income) : ""); setShowIncome(true); }}
                    style={{ fontSize:"0.75rem", color: amber, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}
                  >
                    {gig.income > 0 ? "Edit" : "Set income"}
                  </button>
                </div>
              </div>

              {/* Expense items */}
              {items.map(item => (
                <div key={item.id}
                  onContextMenu={(e) => { e.preventDefault(); setGigCtx({ x: e.clientX, y: e.clientY, target: { type:"gigItem", id: item.id } }); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"4px 0", borderBottom:"1px solid var(--wf-border)", gap:8 }}>
                  <button
                    onClick={() => openEdit(item)}
                    style={{
                      textAlign:"left", background:"none", border:"none", cursor:"pointer", flex:1,
                      color: item.paid ? textMuted : textMain, fontSize:"0.85rem",
                      textDecoration: item.paid ? "line-through" : "none",
                      opacity: item.paid ? 0.55 : 1,
                    }}
                  >{item.name}</button>
                  <button
                    onClick={() => togglePaid(item.id)}
                    title={item.paid ? "Mark as unpaid" : "Mark as paid"}
                    style={{
                      background:"none", cursor:"pointer", flexShrink:0,
                      fontSize:"0.65rem", fontWeight:600, padding:"2px 6px", borderRadius:4,
                      color: item.paid ? "var(--wf-emerald)" : textMuted,
                      border: `1px solid ${item.paid ? "rgba(16,185,129,0.4)" : "var(--wf-border)"}`,
                    }}
                  >{item.paid ? "✓ Paid" : "Paid?"}</button>
                  <span className="wf-data" style={{
                    color: item.paid ? textMuted : textMain,
                    fontSize:"0.85rem", fontWeight:600, flexShrink:0,
                    textDecoration: item.paid ? "line-through" : "none",
                    opacity: item.paid ? 0.55 : 1,
                  }}>{currencySymbol}{fmt(item.amount)}</span>
                </div>
              ))}

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
                <button
                  onClick={() => { setItemName(""); setItemAmount(""); setEditingItemId(null); setShowAddItem(true); }}
                  style={{ fontSize:"0.75rem", color: amber, background:"none", border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:4, fontWeight:600 }}
                >
                  <Plus size={12} weight="bold"/> Add expense
                </button>
                <button
                  onClick={() => onDelete(gig.id)}
                  style={{ fontSize:"0.7rem", color:"var(--wf-pink)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}
                >Delete gig</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit item modal */}
      {showAddItem && (
        <Modal title={editingItemId ? "Edit Expense" : "Add Expense"} onClose={() => setShowAddItem(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Item</label>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)}
                placeholder="e.g. Rent & Bills" autoFocus className="wf-input"/>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Amount</label>
              <NumericInput value={itemAmount} onChange={e => setItemAmount(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveItem(); }}
                placeholder="0.00" className="wf-input wf-input-data"/>
            </div>
            {editingItemId && (
              <button onClick={() => { deleteItem(editingItemId); setEditingItemId(null); setShowAddItem(false); }}
                style={{ color:"var(--wf-pink)", fontSize:"0.8rem", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                Delete this item
              </button>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAddItem(false)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSaveItem} disabled={!itemName.trim() || !itemAmount.trim()} className="wf-btn-primary flex-1 py-2.5">
                {editingItemId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Set Income modal */}
      {showIncome && (
        <Modal title="Set Income" onClose={() => setShowIncome(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Amount ({currencySymbol})</label>
              <NumericInput value={incomeInput} onChange={e => setIncomeInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveIncome(); }}
                placeholder="0.00" autoFocus className="wf-input wf-input-data"/>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowIncome(false)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSaveIncome} disabled={!incomeInput.trim()} className="wf-btn-primary flex-1 py-2.5">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Gig context menu */}      {gigCtx && (
        <ContextMenu
          x={gigCtx.x}
          y={gigCtx.y}
          onClose={() => setGigCtx(null)}
          items={gigCtx.target.type === "gig" ? [
            {
              label: "Rename",
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5a1.5 1.5 0 0 1 2.12 2.12L4.5 11.24 2 12l.76-2.5L10 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              onClick: () => { setRenameGigInput(gig.label); setRenamingGig(true); },
            },
            {
              label: "Delete gig",
              danger: true,
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5l.5 8h4l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              onClick: () => onDelete(gig.id),
            },
          ] : [
            {
              label: "Edit",
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5a1.5 1.5 0 0 1 2.12 2.12L4.5 11.24 2 12l.76-2.5L10 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              onClick: () => {
                const item = items.find(i => i.id === (gigCtx.target as { type:"gigItem"; id:string }).id);
                if (item) openEdit(item);
              },
            },
            {
              label: "Delete",
              danger: true,
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5l.5 8h4l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              onClick: () => deleteItem((gigCtx.target as { type:"gigItem"; id:string }).id),
            },
          ]}
        />
      )}

      {/* Rename gig modal */}
      {renamingGig && (
        <Modal title="Rename Gig" onClose={() => setRenamingGig(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Label</label>
              <input type="text" value={renameGigInput} onChange={e => setRenameGigInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && renameGigInput.trim()) { updateGig(gig.id, { label: renameGigInput.trim() }); setRenamingGig(false); }
                  if (e.key === "Escape") setRenamingGig(false);
                }}
                autoFocus className="wf-input"/>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setRenamingGig(false)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button
                onClick={() => { if (renameGigInput.trim()) updateGig(gig.id, { label: renameGigInput.trim() }); setRenamingGig(false); }}
                disabled={!renameGigInput.trim()} className="wf-btn-primary flex-1 py-2.5">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── FlexibleView root ──────────────────────────────────────────────────────

interface FlexibleViewProps {
  onAddPeriod: (monthKey?: string) => void;
  onAddGig: (monthKey?: string) => void;
}

export default function FlexibleView({ onAddPeriod, onAddGig }: FlexibleViewProps) {
  const { currencySymbol } = useBudgetSettingsCtx();
  const { periods, reorderPeriods, deletePeriod, updatePeriodMeta } = usePeriods();
  const { gigs, deleteGig } = useGigs();

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const dragItemId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null);

  // Context menu state
  type CtxTarget = { type: "group"; key: string } | { type: "period"; id: string };
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; target: CtxTarget } | null>(null);
  const [renamingPeriodId, setRenamingPeriodId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  const openCtxMenu = useCallback((e: React.MouseEvent, target: CtxTarget) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, target });
  }, []);

  // Crossed-out groups (strikethrough label) — persisted to localStorage
  const [crossedOutGroups, setCrossedOutGroups] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("bt_crossed_groups") ?? "[]")); }
    catch { return new Set(); }
  });

  // Custom group labels — persisted to localStorage
  const [groupLabels, setGroupLabels] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("bt_group_labels") ?? "{}"); }
    catch { return {}; }
  });
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [groupLabelInput, setGroupLabelInput] = useState("");
  const [renamingGroupKey, setRenamingGroupKey] = useState<string | null>(null);
  const [renamingGroupInput, setRenamingGroupInput] = useState("");
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);

  const saveGroupLabel = (key: string, label: string) => {
    const trimmed = label.trim();
    const next = { ...groupLabels };
    if (trimmed && trimmed !== formatMonthKey(key)) {
      next[key] = trimmed;
    } else {
      delete next[key]; // revert to auto-derived label
    }
    setGroupLabels(next);
    try { localStorage.setItem("bt_group_labels", JSON.stringify(next)); } catch {}
    setEditingGroupKey(null);
  };

  const toggleOpen = (id: string) => setOpenIds(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleCheck = (id: string) => setCheckedIds(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleMonth = (key: string) => setCollapsedMonths(prev => {
    const s = new Set(prev);
    s.has(key) ? s.delete(key) : s.add(key);
    return s;
  });

  // Drag handlers — reorder within the full periods list
  const handleDragStart = (id: string) => { dragItemId.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
    setDraggingOverId(id);
  };
  const handleDrop = (targetId: string) => {
    if (!dragItemId.current || dragItemId.current === targetId) {
      dragItemId.current = null; dragOverId.current = null; setDraggingOverId(null);
      return;
    }
    // Build new order: move dragItem to just before targetId within the same group
    const allIds = periods.map(p => p.id);
    const fromIdx = allIds.indexOf(dragItemId.current);
    const toIdx   = allIds.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) { dragItemId.current = null; setDraggingOverId(null); return; }
    const reordered = [...allIds];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragItemId.current);
    reorderPeriods(reordered);
    dragItemId.current = null; dragOverId.current = null; setDraggingOverId(null);
  };

  // Group periods by monthKey
  const groups = useMemo(() => {
    const monthMap = new Map<string, Period[]>();
    const ungrouped: Period[] = [];

    for (const p of periods) {
      if (p.monthKey) {
        const arr = monthMap.get(p.monthKey) ?? [];
        arr.push(p);
        monthMap.set(p.monthKey, arr);
      } else {
        ungrouped.push(p);
      }
    }

    // Also collect all monthKeys from gigs so months with only gigs still appear
    for (const g of gigs) {
      if (g.monthKey && !monthMap.has(g.monthKey)) {
        monthMap.set(g.monthKey, []);
      }
    }

    // Sort months newest first
    const sorted = [...monthMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    return { sorted, ungrouped };
  }, [periods, gigs]);

  // Combined buffer for checked periods — needs expense data
  // We calculate this inline per-period using a sub-component
  const CombinedBar = () => {
    const checkedPeriods = periods.filter(p => checkedIds.has(p.id));
    if (checkedPeriods.length === 0) return (
      <div style={{
        position:"sticky", top:0, zIndex:20,
        background:"var(--wf-surface-glass)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid var(--wf-border)", padding:"8px 24px",
        fontSize:"0.75rem", color:"var(--wf-muted)", textAlign:"center",
      }}>
        Check periods below to see combined buffer
      </div>
    );

    return (
      <div style={{
        position:"sticky", top:0, zIndex:20,
        background:"var(--wf-surface-glass)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid var(--wf-border)", padding:"8px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontSize:"0.75rem", color:"var(--wf-muted)", fontWeight:600 }}>
          {checkedPeriods.length} period{checkedPeriods.length !== 1 ? "s" : ""} selected
        </span>
        <CombinedBufferCalc periodIds={[...checkedIds]} sym={currencySymbol} periods={periods} />
      </div>
    );
  };

  if (periods.length === 0) {
    return (
      <div style={{ padding:"40px 24px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"var(--wf-cyan-dim)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Wallet size={24} color="var(--wf-cyan)" weight="fill"/>
          </div>
          <p style={{ fontWeight:700, fontSize:"1.1rem", color:"var(--wf-text)" }}>No periods yet</p>
          <p style={{ color:"var(--wf-muted)", fontSize:"0.9rem" }}>Create your first period to start.</p>
          <button onClick={() => onAddPeriod(getCurrentMonthKey())} className="wf-btn-primary" style={{ padding:"10px 24px" }}>
            + Add Period
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:860, margin:"0 auto", paddingBottom:40 }}>
      <CombinedBar />

      {/* Context menu */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={ctxMenu.target.type === "group" ? [
            {
              label: "Rename",
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5a1.5 1.5 0 0 1 2.12 2.12L4.5 11.24 2 12l.76-2.5L10 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              onClick: () => {
                const k = (ctxMenu.target as { type: "group"; key: string }).key;
                setRenamingGroupInput(groupLabels[k] ?? formatMonthKey(k));
                setRenamingGroupKey(k);
              },
            },
            {
              label: crossedOutGroups.has((ctxMenu.target as { type: "group"; key: string }).key) ? "Remove strikethrough" : "Cross out",
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M4 4l1.5 3M8.5 3L10 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              onClick: () => {
                const k = (ctxMenu.target as { type: "group"; key: string }).key;
                setCrossedOutGroups(prev => {
                  const s = new Set(prev);
                  s.has(k) ? s.delete(k) : s.add(k);
                  try { localStorage.setItem("bt_crossed_groups", JSON.stringify([...s])); } catch {}
                  return s;
                });
              },
            },
            {
              label: "Delete all in group",
              danger: true,
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5l.5 8h4l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              onClick: () => {
                const k = (ctxMenu.target as { type: "group"; key: string }).key;
                const toDelete = k === "__ungrouped__"
                  ? periods.filter(p => !p.monthKey)
                  : periods.filter(p => p.monthKey === k);
                toDelete.forEach(p => deletePeriod(p.id));
              },
            },
          ] : [
            {
              label: "Rename",
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5a1.5 1.5 0 0 1 2.12 2.12L4.5 11.24 2 12l.76-2.5L10 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              onClick: () => {
                const id = (ctxMenu.target as { type: "period"; id: string }).id;
                const p = periods.find(p => p.id === id);
                setRenamingPeriodId(id);
                setRenameInput(p?.label ?? "");
              },
            },
            {
              label: "Delete",
              danger: true,
              icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5l.5 8h4l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              onClick: () => {
                const id = (ctxMenu.target as { type: "period"; id: string }).id;
                deletePeriod(id);
              },
            },
          ]}
        />
      )}

      {/* Rename group modal */}
      {renamingGroupKey && (
        <Modal title="Rename Group" onClose={() => setRenamingGroupKey(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Label</label>
              <input
                type="text" value={renamingGroupInput} onChange={e => setRenamingGroupInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    saveGroupLabel(renamingGroupKey, renamingGroupInput);
                    setRenamingGroupKey(null);
                  }
                  if (e.key === "Escape") setRenamingGroupKey(null);
                }}
                autoFocus className="wf-input"
                placeholder={formatMonthKey(renamingGroupKey)}
              />
              <p style={{ fontSize:"0.7rem", color:"var(--wf-muted)", marginTop:4 }}>Leave blank to reset to the default month label.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setRenamingGroupKey(null)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button
                onClick={() => {
                  saveGroupLabel(renamingGroupKey, renamingGroupInput);
                  setRenamingGroupKey(null);
                }}
                className="wf-btn-primary flex-1 py-2.5"
              >Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rename period modal */}
      {renamingPeriodId && (
        <Modal title="Rename Period" onClose={() => setRenamingPeriodId(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>Label</label>
              <input
                type="text" value={renameInput} onChange={e => setRenameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (renameInput.trim()) { updatePeriodMeta(renamingPeriodId, { label: renameInput.trim() }); }
                    setRenamingPeriodId(null);
                  }
                  if (e.key === "Escape") setRenamingPeriodId(null);
                }}
                autoFocus className="wf-input"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setRenamingPeriodId(null)} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button
                onClick={() => {
                  if (renameInput.trim()) updatePeriodMeta(renamingPeriodId, { label: renameInput.trim() });
                  setRenamingPeriodId(null);
                }}
                disabled={!renameInput.trim()}
                className="wf-btn-primary flex-1 py-2.5"
              >Save</button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ padding:"0 24px" }}>
        {/* Month groups */}
        {groups.sorted.map(([key, groupPeriods]) => (
          <div key={key} style={{ marginTop:24 }}>
            {/* Month header — plain, no card, with hover-reveal edit button */}
            <div
              style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}
              onMouseEnter={() => setHoveredGroupKey(key)}
              onMouseLeave={() => setHoveredGroupKey(null)}
              onContextMenu={(e) => openCtxMenu(e, { type:"group", key })}
            >
              {/* Chevron — only toggles collapse */}
              <button
                onClick={() => { if (editingGroupKey !== key) toggleMonth(key); }}
                onContextMenu={(e) => openCtxMenu(e, { type:"group", key })}
                style={{ display:"flex", alignItems:"center", background:"none", border:"none", cursor:"pointer", padding:"2px 4px" }}
              >
                {collapsedMonths.has(key)
                  ? <CaretRight size={14} color="var(--wf-muted)" />
                  : <CaretDown size={14} color="var(--wf-muted)" />
                }
              </button>

              {/* Label or inline edit input */}
              {editingGroupKey === key ? (
                <input
                  value={groupLabelInput}
                  onChange={e => setGroupLabelInput(e.target.value)}
                  onBlur={() => saveGroupLabel(key, groupLabelInput)}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveGroupLabel(key, groupLabelInput);
                    if (e.key === "Escape") setEditingGroupKey(null);
                  }}
                  autoFocus
                  style={{
                    fontSize:"1rem", fontWeight:700, flex:1,
                    background:"var(--wf-surface-alt)", border:"1px solid var(--wf-cyan)",
                    borderRadius:6, color:"var(--wf-text)", padding:"2px 8px", outline:"none",
                    fontFamily:"var(--font-outfit, system-ui)",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize:"1rem", fontWeight:700, flex:1, cursor:"pointer",
                    color: crossedOutGroups.has(key) ? "var(--wf-muted)" : "var(--wf-text)",
                    textDecoration: crossedOutGroups.has(key) ? "line-through" : "none",
                    opacity: crossedOutGroups.has(key) ? 0.6 : 1,
                  }}
                  onClick={() => toggleMonth(key)}
                  onContextMenu={(e) => openCtxMenu(e, { type:"group", key })}
                >
                  {groupLabels[key] ?? formatMonthKey(key)}
                </span>
              )}

              <span style={{ fontSize:"0.75rem", color:"var(--wf-muted)" }}>
                {groupPeriods.length} period{groupPeriods.length !== 1 ? "s" : ""}
              </span>


              {/* Right-click for rename/options */}
            </div>

            {/* Period accordions */}
            {!collapsedMonths.has(key) && (
              <div style={{ paddingLeft:8 }}>
                {groupPeriods.map(p => (
                  <PeriodAccordion
                    key={p.id}
                    period={p}
                    isOpen={openIds.has(p.id)}
                    isChecked={checkedIds.has(p.id)}
                    onToggleOpen={() => toggleOpen(p.id)}
                    onToggleCheck={() => toggleCheck(p.id)}
                    currencySymbol={currencySymbol}
                    onDragStart={() => handleDragStart(p.id)}
                    onDragOver={(e) => handleDragOver(e, p.id)}
                    onDrop={() => handleDrop(p.id)}
                    isDraggingOver={draggingOverId === p.id}
                    onContextMenu={(e) => openCtxMenu(e, { type:"period", id: p.id })}
                  />
                ))}

                {/* Gig cards for this month */}
                {gigs.filter(g => g.monthKey === key).map(g => (
                  <GigCard key={g.id} gig={g} currencySymbol={currencySymbol} onDelete={deleteGig} />
                ))}

                <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap" }}>
                  <button
                    onClick={() => onAddPeriod(key)}
                    style={{ fontSize:"0.75rem", color:"var(--wf-cyan)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:600 }}
                  >
                    <Plus size={12} weight="bold"/> Add period
                  </button>
                  <button
                    onClick={() => onAddGig(key)}
                    style={{ fontSize:"0.75rem", color:"var(--wf-amber, #F59E0B)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:600 }}
                  >
                    <Plus size={12} weight="bold"/> Add gig
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Ungrouped periods */}
        {groups.ungrouped.length > 0 && (
          <div style={{ marginTop:24 }}>
            <div
              style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}
              onContextMenu={(e) => openCtxMenu(e, { type:"group", key:"__ungrouped__" })}
            >
              <button
                onClick={() => toggleMonth("__ungrouped__")}
                style={{ display:"flex", alignItems:"center", gap:8, textAlign:"left", background:"none", border:"none", cursor:"pointer", flex:1 }}
              >
                {collapsedMonths.has("__ungrouped__")
                  ? <CaretRight size={14} color="var(--wf-muted)" />
                  : <CaretDown size={14} color="var(--wf-muted)" />
                }
                <span style={{
                  fontSize:"1rem", fontWeight:700,
                  color: crossedOutGroups.has("__ungrouped__") ? "var(--wf-muted)" : "var(--wf-muted)",
                  textDecoration: crossedOutGroups.has("__ungrouped__") ? "line-through" : "none",
                  opacity: crossedOutGroups.has("__ungrouped__") ? 0.6 : 1,
                }}>{groupLabels["__ungrouped__"] ?? "Ungrouped"}</span>
                <span style={{ fontSize:"0.75rem", color:"var(--wf-muted)" }}>{groups.ungrouped.length}</span>
              </button>
            </div>

            {!collapsedMonths.has("__ungrouped__") && (
              <div style={{ paddingLeft:8 }}>
                {groups.ungrouped.map(p => (
                  <PeriodAccordion
                    key={p.id}
                    period={p}
                    isOpen={openIds.has(p.id)}
                    isChecked={checkedIds.has(p.id)}
                    onToggleOpen={() => toggleOpen(p.id)}
                    onToggleCheck={() => toggleCheck(p.id)}
                    currencySymbol={currencySymbol}
                    onDragStart={() => handleDragStart(p.id)}
                    onDragOver={(e) => handleDragOver(e, p.id)}
                    onDrop={() => handleDrop(p.id)}
                    isDraggingOver={draggingOverId === p.id}
                    onContextMenu={(e) => openCtxMenu(e, { type:"period", id: p.id })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global add period button */}
        <button
          onClick={() => onAddPeriod(getCurrentMonthKey())}
          className="wf-btn-primary"
          style={{ marginTop:24, width:"100%", padding:"10px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
        >
          <Plus size={14} weight="bold"/> Add New Period
        </button>
        <button
          onClick={() => onAddGig(getCurrentMonthKey())}
          style={{ marginTop:10, width:"100%", padding:"10px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10,
            color:"var(--wf-amber, #F59E0B)", fontWeight:700, fontSize:"0.9rem", cursor:"pointer" }}
        >
          <Plus size={14} weight="bold"/> Add New Gig
        </button>
      </div>
    </div>
  );
}

// ── Helper: reads expense data for checked periods to compute combined buffer ──

function CombinedBufferCalc({ periodIds, sym, periods }: {
  periodIds: string[];
  sym: string;
  periods: Period[];
}) {
  // We can't call hooks inside a loop, so this component renders one period's data at a time
  // using a recursive composition pattern
  if (periodIds.length === 0) return null;

  return (
    <CombinedBufferInner periodIds={periodIds} sym={sym} periods={periods} idx={0} running={0} />
  );
}

function CombinedBufferInner({ periodIds, sym, periods, idx, running }: {
  periodIds: string[];
  sym: string;
  periods: Period[];
  idx: number;
  running: number;
}) {
  const id = periodIds[idx];
  const period = periods.find(p => p.id === id);
  const { s1Total } = useExpenses(id);

  const budget = period?.budget ?? 0;
  const bufferAmount = Math.max(budget - s1Total, 0);
  const newRunning = running + bufferAmount;

  if (idx + 1 < periodIds.length) {
    return (
      <CombinedBufferInner
        periodIds={periodIds} sym={sym} periods={periods}
        idx={idx + 1} running={newRunning}
      />
    );
  }

  return (
    <span className="wf-data" style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--wf-emerald)" }}>
      Combined Buffer: {sym}{newRunning.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}
    </span>
  );
}
