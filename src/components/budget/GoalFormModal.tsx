"use client";

import { useState } from "react";
import type { SavingsGoal } from "@/hooks/useSavingsStore";
import GoalIconPicker from "@/components/budget/GoalIconPicker";
import Modal from "@/components/budget/Modal";
import NumericInput, { parseNumeric } from "@/components/budget/NumericInput";

export type GoalFormData = Omit<SavingsGoal, "id" | "createdAt">;

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Create / edit a savings goal. Pass `goal` to edit; omit it to create.
 * `depositsTotal` (edit only) shows the live total under the starting balance.
 */
export default function GoalFormModal({ goal, depositsTotal = 0, currencySymbol, onSubmit, onClose }: {
  goal?: SavingsGoal;
  depositsTotal?: number;
  currencySymbol: string;
  onSubmit: (data: GoalFormData) => void;
  onClose: () => void;
}) {
  const isEdit = !!goal;
  const [form, setForm] = useState({
    name:                goal?.name ?? "",
    targetAmount:        goal ? String(goal.targetAmount) : "",
    currentAmount:       goal ? String(goal.currentAmount) : "0",
    targetDate:          goal?.targetDate ?? "",
    monthlyContribution: goal?.monthlyContribution !== undefined ? String(goal.monthlyContribution) : "",
    icon:                goal?.icon ?? "piggybank",
  });

  const handleSubmit = () => {
    const target  = parseNumeric(form.targetAmount);
    const current = parseNumeric(form.currentAmount) || 0;
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    onSubmit({
      name: form.name.trim(), targetAmount: target, currentAmount: current,
      icon: form.icon || "piggybank",
      targetDate: form.targetDate || undefined,
      monthlyContribution: form.monthlyContribution ? parseNumeric(form.monthlyContribution) : undefined,
    });
  };

  const fp = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const liveTotal = (parseNumeric(form.currentAmount) || 0) + depositsTotal;

  return (
    <Modal title={isEdit ? "Edit Goal" : "Create New Goal"} onClose={onClose}>
      <div className="space-y-4">
        {[
          { label:"Goal Name", el:
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <GoalIconPicker
                selected={form.icon}
                onChange={(key) => setForm(f => ({ ...f, icon: key }))}
                color="var(--wf-cyan)"
              />
              <input type="text" {...fp("name")} placeholder="e.g. Emergency Fund" autoFocus className="wf-input" style={{ flex:1 }}
                onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}}/>
            </div>
          },
          { label:`Target Amount (${currencySymbol})`, el:<NumericInput {...fp("targetAmount")} placeholder="0.00" className="wf-input wf-input-data"/> },
          // Edit: this is the starting balance; deposits are added on top of it
          { label: isEdit ? `Starting balance (${currencySymbol})` : `Already Saved (${currencySymbol})`, el:
            <>
              <NumericInput {...fp("currentAmount")} placeholder="0.00" className="wf-input wf-input-data"/>
              {isEdit && (
                <p className="text-xs mt-1.5" style={{ color:"var(--wf-muted)" }}>
                  Deposits are added on top of this. Current total: {currencySymbol}{fmt(liveTotal)}
                </p>
              )}
            </>
          },
          { label:"Target Date (optional)", el:<input type="date" {...fp("targetDate")} className="wf-input"/> },
          { label:`Monthly Contribution (${currencySymbol}, optional)`, el:<NumericInput {...fp("monthlyContribution")} placeholder="0.00" className="wf-input wf-input-data"/> },
        ].map(({ label, el }) => (
          <div key={label}>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:"var(--wf-muted)" }}>{label}</label>
            {el}
          </div>
        ))}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
          <button onClick={handleSubmit} disabled={!form.name.trim()||!form.targetAmount}
            className="wf-btn-primary flex-1 py-2.5">{isEdit ? "Save Changes" : "Add Goal"}</button>
        </div>
      </div>
    </Modal>
  );
}
