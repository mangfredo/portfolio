"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/budget/Modal";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface CopyBudgetModalProps {
  mode: "month" | "period";
  sourceMonthKey?: string;      // for month mode
  sourcePeriodId?: string;      // for period mode
  sourcePeriodLabel?: string;   // for period mode display
  onClose: () => void;
  onConfirm: (
    selectedMonths: string[],
    selectedDates?: Array<{ monthKey: string; day: number }>
  ) => void;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CopyBudgetModal({
  mode,
  sourceMonthKey,
  sourcePeriodId,
  sourcePeriodLabel,
  onClose,
  onConfirm,
}: CopyBudgetModalProps) {
  const currentYear = new Date().getFullYear();
  const [viewingYear, setViewingYear] = useState(currentYear);
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  
  // For period mode: step 2 is date selection
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set()); // "YYYY-MM-DD" format

  const toggleMonth = useCallback((monthKey: string) => {
    setSelectedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
        // Also remove any selected dates for this month
        setSelectedDates(prevDates => {
          const nextDates = new Set(prevDates);
          for (const d of prevDates) {
            if (d.startsWith(monthKey)) {
              nextDates.delete(d);
            }
          }
          return nextDates;
        });
      } else {
        next.add(monthKey);
      }
      return next;
    });
  }, []);

  const handleConfirm = () => {
    const months = Array.from(selectedMonths);
    
    if (mode === "month") {
      onConfirm(months);
    } else {
      // Period mode: convert selectedDates to array of {monthKey, day}
      const dates: Array<{ monthKey: string; day: number }> = [];
      for (const dateStr of selectedDates) {
        const [year, month, day] = dateStr.split("-").map(Number);
        const monthKey = `${year}-${String(month).padStart(2, "0")}`;
        dates.push({ monthKey, day });
      }
      onConfirm(months, dates);
    }
  };

  const canConfirm = mode === "month" 
    ? selectedMonths.size > 0 
    : selectedDates.size > 0;

  // Format source info for display
  const sourceDisplay = mode === "month" && sourceMonthKey
    ? formatMonthKeyDisplay(sourceMonthKey)
    : sourcePeriodLabel || "Period";

  const title = mode === "month" 
    ? `Copy ${sourceDisplay}'s Budget` 
    : `Copy "${sourceDisplay}" to...`;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        {step === 1 ? (
          <>
            {/* Year navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewingYear(y => y - 1)}
                className="wf-icon-btn"
                aria-label="Previous year"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <span className="font-semibold text-lg">{viewingYear}</span>
              <button
                onClick={() => setViewingYear(y => y + 1)}
                className="wf-icon-btn"
                aria-label="Next year"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>

            {/* Month grid - 3x4 */}
            <div className="grid grid-cols-4 gap-2">
              {MONTH_NAMES.map((name, idx) => {
                const monthKey = `${viewingYear}-${String(idx + 1).padStart(2, "0")}`;
                const isSelected = selectedMonths.has(monthKey);
                const isSource = monthKey === sourceMonthKey;
                
                return (
                  <button
                    key={monthKey}
                    onClick={() => !isSource && toggleMonth(monthKey)}
                    disabled={isSource}
                    className={`
                      relative py-3 px-2 rounded-lg text-sm font-medium transition-all
                      ${isSource 
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed" 
                        : isSelected
                          ? "!bg-blue-500 !text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--wf-bg)]"
                          : "bg-[var(--wf-surface)] hover:bg-[var(--wf-surface-hover)] text-[var(--wf-text)]"
                      }
                    `}
                  >
                    {name}
                    {isSource && (
                      <span className="absolute -top-1 -right-1 text-[10px] bg-[var(--wf-muted)] text-white px-1 rounded">
                        src
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection count */}
            {selectedMonths.size > 0 && (
              <p className="text-xs text-center" style={{ color: "var(--wf-muted)" }}>
                {selectedMonths.size} month{selectedMonths.size !== 1 ? "s" : ""} selected
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="wf-btn-ghost flex-1 py-2.5">
                Cancel
              </button>
              {mode === "period" ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedMonths.size === 0}
                  className="wf-btn-primary flex-1 py-2.5 disabled:opacity-50"
                >
                  Next: Select Dates
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="wf-btn-primary flex-1 py-2.5 disabled:opacity-50"
                >
                  Copy to {selectedMonths.size} Month{selectedMonths.size !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Step 2: Date selection for period mode - implemented in Task 5 */
          <DatePickerStep
            selectedMonths={selectedMonths}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            onBack={() => setStep(1)}
            onConfirm={handleConfirm}
            canConfirm={canConfirm}
          />
        )}
      </div>
    </Modal>
  );
}

// Date picker step component for period mode
function DatePickerStep({
  selectedMonths,
  selectedDates,
  setSelectedDates,
  onBack,
  onConfirm,
  canConfirm,
}: {
  selectedMonths: Set<string>;
  selectedDates: Set<string>;
  setSelectedDates: React.Dispatch<React.SetStateAction<Set<string>>>;
  onBack: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
}) {
  const sortedMonths = Array.from(selectedMonths).sort();

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  // Quick select: apply same day to all selected months (toggle behavior)
  const applyDayToAll = (day: number) => {
    const allSelected = isDaySelectedForAll(day);
    setSelectedDates(prev => {
      const next = new Set(prev);
      for (const monthKey of selectedMonths) {
        const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
        if (allSelected) {
          next.delete(dateStr);
        } else {
          next.add(dateStr);
        }
      }
      return next;
    });
  };

  // Check if a day is selected for all months
  const isDaySelectedForAll = (day: number) => {
    for (const monthKey of selectedMonths) {
      const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
      if (!selectedDates.has(dateStr)) return false;
    }
    return true;
  };

  return (
    <>
      {/* Quick select buttons */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--wf-muted)" }}>
          Quick Select (applies to all months)
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1, 15, 30].map(day => (
            <button
              key={day}
              onClick={() => applyDayToAll(day)}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-all
                ${isDaySelectedForAll(day)
                  ? "!bg-blue-500 !text-white ring-2 ring-blue-500 ring-offset-1 ring-offset-[var(--wf-bg)]"
                  : "bg-[var(--wf-surface)] hover:bg-[var(--wf-surface-hover)] text-[var(--wf-text)]"
                }
              `}
            >
              {day === 1 ? "1st" : day === 15 ? "15th" : "30th"}
            </button>
          ))}
          <button
            onClick={() => {
              // End of month: use 28 as safe "end of month" 
              applyDayToAll(28);
            }}
            className={`
              px-3 py-1.5 rounded text-sm font-medium transition-all
              ${isDaySelectedForAll(28)
                ? "!bg-blue-500 !text-white ring-2 ring-blue-500 ring-offset-1 ring-offset-[var(--wf-bg)]"
                : "bg-[var(--wf-surface)] hover:bg-[var(--wf-surface-hover)] text-[var(--wf-text)]"
              }
            `}
          >
            28th
          </button>
        </div>
      </div>

      {/* Per-month day selection */}
      <div className="max-h-[300px] overflow-y-auto space-y-3">
        {sortedMonths.map(monthKey => {
          const [year, month] = monthKey.split("-").map(Number);
          const monthName = MONTH_NAMES_FULL[month - 1];
          const daysInMonth = new Date(year, month, 0).getDate();
          
          return (
            <div key={monthKey} className="p-3 rounded-lg" style={{ background: "var(--wf-surface)" }}>
              <p className="text-sm font-semibold mb-2">{monthName} {year}</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
                  const isSelected = selectedDates.has(dateStr);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDate(dateStr)}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${isSelected
                          ? "!bg-blue-500 !text-white ring-2 ring-blue-500 ring-offset-1 ring-offset-[var(--wf-surface)]"
                          : "bg-[var(--wf-bg)] hover:bg-[var(--wf-surface-hover)] text-[var(--wf-text)]"
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection count */}
      {selectedDates.size > 0 && (
        <p className="text-xs text-center" style={{ color: "var(--wf-muted)" }}>
          {selectedDates.size} date{selectedDates.size !== 1 ? "s" : ""} selected
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="wf-btn-ghost flex-1 py-2.5">
          <CaretLeft size={14} className="inline mr-1" />
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="wf-btn-primary flex-1 py-2.5 disabled:opacity-50"
        >
          Copy to {selectedDates.size} Date{selectedDates.size !== 1 ? "s" : ""}
        </button>
      </div>
    </>
  );
}

// Helper to format monthKey for display
function formatMonthKeyDisplay(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_NAMES_FULL[month - 1]} ${year}`;
}

export default CopyBudgetModal;
