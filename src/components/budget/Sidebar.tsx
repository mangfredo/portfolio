"use client";

import { useRef } from "react";
import { exportData, importData } from "@/lib/budgetBackup";

interface SidebarProps {
  onBack: () => void;
  onReset: () => void;
  onClear: () => void;
}

const NAV_ITEMS = [
  { label: "Overview", icon: "◈", active: true, disabled: false },
];

export default function Sidebar({ onBack, onReset, onClear }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      window.location.href = "/budget-tracker";
    } catch {
      alert("Could not import — make sure the file is a valid budget backup.");
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <aside className="bt-sidebar flex flex-col h-full py-6 px-4">
      {/* Brand */}
      <div className="mb-8 px-2">
        <p className="text-[0.6rem] uppercase tracking-[0.18em] mb-1" style={{ color: "#4A6FA5" }}>
          Portfolio App
        </p>
        <h1 className="text-base font-bold tracking-tight" style={{ color: "#E2E8F0" }}>
          Budget Engine
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`bt-nav-item ${item.active ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
          >
            <span className="text-sm w-4 text-center opacity-70">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Backup */}
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[0.6rem] uppercase tracking-widest px-2 mb-2" style={{ color: "#4A6FA5" }}>
          Backup
        </p>
        <button
          onClick={exportData}
          className="bt-nav-item text-xs w-full"
          style={{ color: "#94A3B8" }}
        >
          <span className="text-sm opacity-60">↓</span>
          Export Data
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bt-nav-item text-xs w-full"
          style={{ color: "#94A3B8" }}
        >
          <span className="text-sm opacity-60">↑</span>
          Import Data
        </button>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      {/* Demo controls */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[0.6rem] uppercase tracking-widest px-2 mb-2" style={{ color: "#4A6FA5" }}>
          Demo
        </p>
        <button
          onClick={onReset}
          className="bt-nav-item text-xs w-full"
          style={{ color: "#94A3B8" }}
        >
          <span className="text-sm opacity-60">↺</span>
          Load Sample Data
        </button>
        <button
          onClick={onClear}
          className="bt-nav-item text-xs w-full"
          style={{ color: "#94A3B8" }}
        >
          <span className="text-sm opacity-60">✕</span>
          Clear All Data
        </button>
      </div>

      {/* Back to portfolio */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={onBack}
          className="bt-nav-item text-xs w-full"
          style={{ color: "#64748B" }}
        >
          <span className="text-sm opacity-60">←</span>
          Back to Portfolio
        </button>
      </div>
    </aside>
  );
}
