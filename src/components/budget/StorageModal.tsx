"use client";

import { useState } from "react";
import { Desktop, Cloud, CheckCircle } from "@phosphor-icons/react";
import Modal from "./Modal";
import {
  parseFirebaseConfig, loadFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig,
  type FirebaseWebConfig,
} from "@/lib/firebaseConfig";
import type { ToastType } from "@/hooks/useToast";

interface StorageModalProps {
  onClose: () => void;
  onToast: (msg: string, type?: ToastType) => void;
}

type Mode = "local" | "firebase";

const labelCls = "block text-xs font-semibold uppercase tracking-wider mb-2";

export default function StorageModal({ onClose, onToast }: StorageModalProps) {
  const [saved, setSaved] = useState<FirebaseWebConfig | null>(() => loadFirebaseConfig());
  const [mode, setMode] = useState<Mode>(saved ? "firebase" : "local");
  const [configText, setConfigText] = useState("");
  const [error, setError] = useState("");

  function handleSave() {
    const result = parseFirebaseConfig(configText);
    if (!result.ok) { setError(result.error); return; }
    saveFirebaseConfig(result.config);
    setSaved(result.config);
    setConfigText("");
    setError("");
    onToast("Firebase config saved", "success");
  }

  function handleDisconnect() {
    clearFirebaseConfig();
    setSaved(null);
    setMode("local");
    onToast("Using this browser only", "success");
  }

  const optionStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
    borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%",
    background: active ? "var(--wf-cyan-dim)" : "var(--wf-surface-alt)",
    border: `1px solid ${active ? "var(--wf-cyan)" : "var(--wf-border)"}`,
    color: "var(--wf-text)",
  });

  return (
    <Modal title="Data Storage" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <button type="button" style={optionStyle(mode === "local")}
            onClick={() => { if (!saved) setMode("local"); }}
            disabled={!!saved} aria-pressed={mode === "local"}>
            <Desktop size={18} />
            <span>
              <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem" }}>This browser</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--wf-muted)" }}>Data stays on this device only.</span>
            </span>
          </button>
          <button type="button" style={optionStyle(mode === "firebase")}
            onClick={() => setMode("firebase")} aria-pressed={mode === "firebase"}>
            <Cloud size={18} />
            <span>
              <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem" }}>Your Firebase</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--wf-muted)" }}>Sync to a Firebase project you own.</span>
            </span>
          </button>
        </div>

        {mode === "firebase" && saved && (
          <div className="space-y-3">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--wf-text)" }}>
              <CheckCircle size={16} weight="fill" style={{ color: "var(--wf-emerald)" }} />
              Connected to <strong style={{ fontFamily: "var(--wf-data-font)" }}>{saved.projectId}</strong>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--wf-muted)", margin: 0 }}>
              Sign-in and sync are coming next — your data is still saved in this browser for now.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="wf-btn-ghost flex-1 py-2.5">Close</button>
              <button onClick={handleDisconnect} className="wf-btn-ghost flex-1 py-2.5"
                style={{ color: "var(--wf-pink)" }}>Disconnect</button>
            </div>
          </div>
        )}

        {mode === "firebase" && !saved && (
          <div className="space-y-3">
            <div>
              <label htmlFor="bt-fb-config" className={labelCls} style={{ color: "var(--wf-muted)" }}>
                Firebase web app config
              </label>
              <textarea id="bt-fb-config" value={configText}
                onChange={(e) => { setConfigText(e.target.value); setError(""); }}
                placeholder={'const firebaseConfig = {\n  apiKey: "AIza…",\n  authDomain: "your-app.firebaseapp.com",\n  projectId: "your-app",\n  appId: "1:…:web:…"\n};'}
                rows={7} spellCheck={false} className="wf-input wf-input-data"
                style={{ resize: "vertical", fontSize: "0.75rem" }}
                aria-invalid={!!error} aria-describedby="bt-fb-help" />
              {error && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--wf-pink)", margin: "6px 0 0" }}>{error}</p>
              )}
            </div>
            <p id="bt-fb-help" style={{ fontSize: "0.75rem", color: "var(--wf-muted)", margin: 0, lineHeight: 1.5 }}>
              Firebase console → Project settings → Your apps → Web app → SDK setup and configuration.
              This config is public by design; your Firestore rules keep the data private.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="wf-btn-ghost flex-1 py-2.5">Cancel</button>
              <button onClick={handleSave} disabled={!configText.trim()} className="wf-btn-primary flex-1 py-2.5">Save config</button>
            </div>
          </div>
        )}

        {mode === "local" && (
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="wf-btn-ghost flex-1 py-2.5">Close</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
