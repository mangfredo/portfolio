"use client";

/**
 * NumericInput — a text input that displays thousand-separated commas while
 * typing and hides browser spinner arrows.
 *
 * Props mirror a regular <input> but value/onChange work with raw numeric
 * strings (no commas).  The displayed value has commas inserted automatically.
 *
 * Consumers: use parseFloat(value.replace(/,/g, "")) to get the number.
 * The helper `parseNumeric(str)` is exported for convenience.
 */

import { useRef } from "react";

interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Strip commas then parseFloat — use this everywhere instead of bare parseFloat. */
export function parseNumeric(val: string): number {
  return parseFloat(val.replace(/,/g, ""));
}

/** Format a raw numeric string (may include one decimal point) with thousand commas. */
function addCommas(raw: string): string {
  if (!raw) return raw;
  // Split on decimal point (keep at most one)
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

/** Strip commas and allow only digits + one decimal point. */
function sanitize(input: string): string {
  // Remove anything that isn't a digit or decimal point
  const stripped = input.replace(/,/g, "").replace(/[^\d.]/g, "");
  // Allow only one decimal point
  const parts = stripped.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  return stripped;
}

export default function NumericInput({
  value,
  onChange,
  className,
  ...rest
}: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitize(e.target.value);
    // Preserve cursor position offset caused by inserted commas
    const el = e.target;
    const prevFormatted = addCommas(value);
    const nextFormatted = addCommas(raw);
    const cursorPos = el.selectionStart ?? nextFormatted.length;
    // Count commas before cursor in old vs new value to adjust position
    const commasBefore = (prevFormatted.slice(0, cursorPos).match(/,/g) ?? []).length;
    const newCommasBefore = (nextFormatted.slice(0, cursorPos).match(/,/g) ?? []).length;
    const adjustment = newCommasBefore - commasBefore;

    // Fire onChange with a synthetic event carrying the raw (no-comma) value
    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: raw },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);

    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newPos = Math.max(0, cursorPos + adjustment);
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={addCommas(value)}
      onChange={handleChange}
      className={className}
    />
  );
}
