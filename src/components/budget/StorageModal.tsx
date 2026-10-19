"use client";

import { useEffect, useState } from "react";
import { Desktop, Cloud, CheckCircle, GoogleLogo, SignOut, CopySimple } from "@phosphor-icons/react";
import Modal from "./Modal";
import {
  parseFirebaseConfig, loadFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig,
  type FirebaseWebConfig,
} from "@/lib/firebaseConfig";
import {
  watchFirebaseUser, signInWithGoogle, signOutFirebase, disposeFirebase, describeAuthError,
  type FirebaseUserInfo,
} from "@/lib/firebaseClient";
import {
  isLinked, setLinked, clearLinked, localAppKeys, fetchRemote, uploadLocal,
  getSyncStatus, describeSyncError, FIRESTORE_RULES, SYNC_STATUS_EVENT, SYNC_LINKED_EVENT,
  type SyncStatus,
} from "@/lib/firebaseSync";
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
  // undefined = still checking, null = signed out
  const [user, setUser] = useState<FirebaseUserInfo | null | undefined>(undefined);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  // Follow sign-in state for the saved project (loads the Firebase SDK on demand)
  useEffect(() => {
    if (!saved) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;
    watchFirebaseUser(saved, (u) => { if (!cancelled) setUser(u); })
      .then((fn) => { if (cancelled) fn(); else unsub = fn; })
      .catch((err) => { if (!cancelled) { setUser(null); setAuthError(describeAuthError(err) ?? ""); } });
    return () => { cancelled = true; unsub?.(); };
  }, [saved]);

  // Re-render when sync links/unlinks or its status changes
  const [, setLinkTick] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => getSyncStatus());
  useEffect(() => {
    const onLinked = () => setLinkTick((t) => t + 1);
    const onStatus = () => setSyncStatus(getSyncStatus());
    window.addEventListener(SYNC_LINKED_EVENT, onLinked);
    window.addEventListener(SYNC_STATUS_EVENT, onStatus);
    return () => {
      window.removeEventListener(SYNC_LINKED_EVENT, onLinked);
      window.removeEventListener(SYNC_STATUS_EVENT, onStatus);
    };
  }, []);

  const linked = !!(saved && user && isLinked(saved, user.uid));

  // Before linking: count what's in the cloud so the user can pick a direction
  const [remoteCount, setRemoteCount] = useState<number | undefined>(undefined);
  const [syncError, setSyncError] = useState("");
  const [startBusy, setStartBusy] = useState(false);
  // Currency is auto-saved on first visit, so it doesn't count as "having data"
  const isDataKey = (k: string) => k !== "bt_currency";
  const localCount = typeof window !== "undefined" ? localAppKeys().filter(isDataKey).length : 0;
  useEffect(() => {
    if (!saved || !user || linked) return;
    let cancelled = false;
    fetchRemote(saved, user.uid)
      .then((m) => { if (!cancelled) { setRemoteCount([...m.keys()].filter(isDataKey).length); setSyncError(""); } })
      .catch((err) => { if (!cancelled) setSyncError(describeSyncError(err)); });
    return () => { cancelled = true; };
  }, [saved, user, linked]);

  async function handleStart(direction: "upload" | "download") {
    if (!saved || !user) return;
    setStartBusy(true);
    setSyncError("");
    try {
      if (direction === "upload") await uploadLocal(saved, user.uid);
      setLinked(saved, user.uid); // the shell's sync hook pulls cloud data and starts pushing
      onToast(direction === "upload" ? "Uploaded — syncing to Firebase" : "Syncing from Firebase", "success");
    } catch (err) {
      setSyncError(describeSyncError(err));
    } finally {
      setStartBusy(false);
    }
  }

  async function copyRules() {
    try { await navigator.clipboard.writeText(FIRESTORE_RULES); onToast("Rules copied", "success"); }
    catch { onToast("Couldn't copy — select the rules manually", "error"); }
  }

  function handleSave() {
    const result = parseFirebaseConfig(configText);
    if (!result.ok) { setError(result.error); return; }
    saveFirebaseConfig(result.config);
    setUser(undefined);
    setAuthError("");
    setSaved(result.config);
    setConfigText("");
    setError("");
    onToast("Firebase config saved", "success");
  }

  async function handleSignIn() {
    if (!saved) return;
    setAuthBusy(true);
    setAuthError("");
    try {
      const u = await signInWithGoogle(saved);
      onToast(`Signed in as ${u.email ?? u.displayName ?? "Google user"}`, "success");
    } catch (err) {
      setAuthError(describeAuthError(err) ?? "");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    setAuthBusy(true);
    try { await signOutFirebase(); } finally { setAuthBusy(false); }
  }

  async function handleDisconnect() {
    clearFirebaseConfig();
    clearLinked(); // stops the shell's sync before the app is torn down
    await disposeFirebase();
    setSaved(null);
    setUser(undefined);
    setAuthError("");
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
              Config saved for <strong style={{ fontFamily: "var(--wf-data-font)" }}>{saved.projectId}</strong>
            </div>

            {user === undefined && (
              <p style={{ fontSize: "0.8rem", color: "var(--wf-muted)", margin: 0 }}>Checking sign-in…</p>
            )}

            {user === null && (
              <button onClick={handleSignIn} disabled={authBusy} className="wf-btn-primary w-full py-2.5"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <GoogleLogo size={16} weight="bold" />
                {authBusy ? "Signing in…" : "Sign in with Google"}
              </button>
            )}

            {user && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                padding: "10px 12px", borderRadius: 10, background: "var(--wf-surface-alt)", border: "1px solid var(--wf-border)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--wf-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Signed in as <strong>{user.email ?? user.displayName ?? user.uid}</strong>
                </span>
                <button onClick={handleSignOut} disabled={authBusy} className="wf-icon-btn" title="Sign out" aria-label="Sign out">
                  <SignOut size={14} />
                </button>
              </div>
            )}

            {authError && (
              <p role="alert" style={{ fontSize: "0.75rem", color: "var(--wf-pink)", margin: 0, lineHeight: 1.5 }}>{authError}</p>
            )}

            {/* First time on this browser: choose which copy wins */}
            {user && !linked && (
              <div className="space-y-2">
                <p style={{ fontSize: "0.8rem", color: "var(--wf-text)", margin: 0, fontWeight: 600 }}>Start syncing</p>
                {remoteCount === undefined && !syncError && (
                  <p style={{ fontSize: "0.75rem", color: "var(--wf-muted)", margin: 0 }}>Checking your Firestore…</p>
                )}
                {remoteCount !== undefined && (
                  <>
                    <p style={{ fontSize: "0.75rem", color: "var(--wf-muted)", margin: 0, lineHeight: 1.5 }}>
                      This browser has <strong>{localCount}</strong> saved {localCount === 1 ? "list" : "lists"}; your Firestore has <strong>{remoteCount}</strong>.
                      {localCount > 0 && remoteCount > 0 && " Pick which copy to keep — the other is replaced."}
                    </p>
                    <div className="flex gap-3">
                      {(localCount > 0 || remoteCount === 0) && (
                        <button onClick={() => handleStart("upload")} disabled={startBusy} className="wf-btn-primary flex-1 py-2.5">
                          {remoteCount > 0 ? "Use this browser's data" : "Upload & sync"}
                        </button>
                      )}
                      {remoteCount > 0 && (
                        <button onClick={() => handleStart("download")} disabled={startBusy}
                          className={localCount > 0 ? "wf-btn-ghost flex-1 py-2.5" : "wf-btn-primary flex-1 py-2.5"}>
                          {localCount > 0 ? "Use cloud data" : "Download & sync"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {linked && (
              <p style={{ fontSize: "0.75rem", margin: 0, color: syncStatus.state === "error" ? "var(--wf-pink)" : "var(--wf-muted)" }} aria-live="polite">
                {syncStatus.state === "syncing" && "Syncing…"}
                {syncStatus.state === "synced" && `Synced${syncStatus.at ? ` at ${new Date(syncStatus.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""} — changes upload automatically.`}
                {syncStatus.state === "error" && syncStatus.error}
                {syncStatus.state === "off" && "Starting sync…"}
              </p>
            )}

            {syncError && (
              <p role="alert" style={{ fontSize: "0.75rem", color: "var(--wf-pink)", margin: 0, lineHeight: 1.5 }}>{syncError}</p>
            )}

            {!user && (
              <p style={{ fontSize: "0.75rem", color: "var(--wf-muted)", margin: 0 }}>
                Sign in to sync. Until then, data stays in this browser.
              </p>
            )}

            <details style={{ fontSize: "0.75rem", color: "var(--wf-muted)" }}>
              <summary style={{ cursor: "pointer" }}>Firestore security rules</summary>
              <p style={{ margin: "6px 0", lineHeight: 1.5 }}>
                Firebase console → Firestore Database → Rules. Paste and publish so only you can read your data.
              </p>
              <div style={{ position: "relative" }}>
                <pre className="wf-input wf-input-data" style={{ fontSize: "0.7rem", whiteSpace: "pre", overflowX: "auto", margin: 0 }}>{FIRESTORE_RULES}</pre>
                <button onClick={copyRules} className="wf-icon-btn" title="Copy rules" aria-label="Copy rules"
                  style={{ position: "absolute", top: 6, right: 6 }}>
                  <CopySimple size={14} />
                </button>
              </div>
            </details>

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
