/**
 * Firestore sync for LaanFlow ("bring your own Firebase").
 *
 * Remote layout — one document per localStorage app key:
 *   users/{uid}/laanflow/{encodeURIComponent(key)} → { value: <raw localStorage string>, updatedAt }
 *
 * localStorage stays the working copy. While sync runs:
 *   - on start, cloud data replaces this browser's app keys (cloud is the source of truth)
 *   - every app-key write/remove is captured and pushed after a short debounce
 *
 * Writes are captured by wrapping localStorage.setItem/removeItem (only while
 * sync is active), so the stores don't need to know about Firebase.
 */

import type { Firestore } from "firebase/firestore";
import { isAppKey } from "./budgetBackup";
import type { FirebaseWebConfig } from "./firebaseConfig";
import { getFirestoreFor } from "./firebaseClient";

const LINK_KEY = "bt_firebase_link"; // "<projectId>:<uid>" once the user picked how to start
const PUSH_DELAY_MS = 1500;
const BATCH_LIMIT = 450; // Firestore allows 500 ops per batch

// ── Status (shared with the Storage dialog) ────────────────────────────────
export type SyncState = "off" | "syncing" | "synced" | "error";
export interface SyncStatus { state: SyncState; at?: number; error?: string }

let status: SyncStatus = { state: "off" };
export const SYNC_STATUS_EVENT = "bt_sync_status";
export const SYNC_LINKED_EVENT = "bt_sync_linked";

export function getSyncStatus(): SyncStatus { return status; }
function setStatus(next: SyncStatus) {
  status = next;
  window.dispatchEvent(new Event(SYNC_STATUS_EVENT));
}

// ── Link marker ────────────────────────────────────────────────────────────
const linkId = (config: FirebaseWebConfig, uid: string) => `${config.projectId}:${uid}`;
export function isLinked(config: FirebaseWebConfig, uid: string): boolean {
  return localStorage.getItem(LINK_KEY) === linkId(config, uid);
}
export function setLinked(config: FirebaseWebConfig, uid: string) {
  localStorage.setItem(LINK_KEY, linkId(config, uid));
  window.dispatchEvent(new Event(SYNC_LINKED_EVENT));
}
export function clearLinked() {
  localStorage.removeItem(LINK_KEY);
  window.dispatchEvent(new Event(SYNC_LINKED_EVENT));
}

// ── Local / remote snapshots ───────────────────────────────────────────────
export function localAppKeys(): string[] {
  return Object.keys(localStorage).filter(isAppKey);
}

async function remoteCol(config: FirebaseWebConfig, uid: string) {
  const db: Firestore = await getFirestoreFor(config);
  const { collection } = await import("firebase/firestore");
  return { db, col: collection(db, "users", uid, "laanflow") };
}

/** All remote app keys → raw localStorage strings. */
export async function fetchRemote(config: FirebaseWebConfig, uid: string): Promise<Map<string, string>> {
  const { col } = await remoteCol(config, uid);
  const { getDocs } = await import("firebase/firestore");
  const snap = await getDocs(col);
  const out = new Map<string, string>();
  snap.forEach((d) => {
    const key = decodeURIComponent(d.id);
    const value = d.data().value;
    if (isAppKey(key) && typeof value === "string") out.set(key, value);
  });
  return out;
}

/** Write a set of changes: value string = upsert, null = delete. */
async function writeChanges(config: FirebaseWebConfig, uid: string, changes: Map<string, string | null>) {
  if (changes.size === 0) return;
  const { db, col } = await remoteCol(config, uid);
  const { doc, writeBatch, serverTimestamp } = await import("firebase/firestore");
  const entries = [...changes];
  for (let i = 0; i < entries.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const [key, value] of entries.slice(i, i + BATCH_LIMIT)) {
      const ref = doc(col, encodeURIComponent(key));
      if (value === null) batch.delete(ref);
      else batch.set(ref, { value, updatedAt: serverTimestamp() });
    }
    await batch.commit();
  }
}

/** Replace the cloud copy with this browser's app keys. */
export async function uploadLocal(config: FirebaseWebConfig, uid: string): Promise<void> {
  const remote = await fetchRemote(config, uid);
  const changes = new Map<string, string | null>();
  for (const key of localAppKeys()) changes.set(key, localStorage.getItem(key));
  for (const key of remote.keys()) if (!changes.has(key)) changes.set(key, null);
  await writeChanges(config, uid, changes);
}

// ── Write capture ──────────────────────────────────────────────────────────
let active: { config: FirebaseWebConfig; uid: string } | null = null;
let suppress = false; // true while applying cloud data, so it isn't echoed back
const dirty = new Map<string, string | null>();
let dirtyOwner: string | null = null; // "<projectId>:<uid>" the dirty changes belong to
let pending: Promise<void> = Promise.resolve(); // last upload; startSync waits for it
let timer: ReturnType<typeof setTimeout> | null = null;
let restore: (() => void) | null = null;

function patchStorage() {
  if (restore) return;
  const proto = Storage.prototype;
  const origSet = proto.setItem;
  const origRemove = proto.removeItem;
  proto.setItem = function (this: Storage, key: string, value: string) {
    origSet.call(this, key, value);
    if (this === localStorage && !suppress && isAppKey(key)) markDirty(key, String(value));
  };
  proto.removeItem = function (this: Storage, key: string) {
    origRemove.call(this, key);
    if (this === localStorage && !suppress && isAppKey(key)) markDirty(key, null);
  };
  restore = () => { proto.setItem = origSet; proto.removeItem = origRemove; restore = null; };
}

function markDirty(key: string, value: string | null) {
  dirty.set(key, value);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void flush(); }, PUSH_DELAY_MS);
}

function flush(): Promise<void> {
  timer = null;
  if (!active || dirty.size === 0) return pending;
  const { config, uid } = active;
  const changes = new Map(dirty);
  dirty.clear();
  setStatus({ state: "syncing" });
  pending = pending.then(async () => {
    try {
      await writeChanges(config, uid, changes);
      if (active) setStatus({ state: "synced", at: Date.now() });
    } catch (err) {
      // Put the failed changes back (newer edits win) so the next write retries them
      for (const [k, v] of changes) if (!dirty.has(k)) dirty.set(k, v);
      if (active) setStatus({ state: "error", error: describeSyncError(err) });
    }
  });
  return pending;
}

function onPageHide() { if (dirty.size) void flush(); }

/**
 * Start syncing: pull cloud data into localStorage, then push local edits.
 * Returns true if local data was replaced (caller should reload the stores).
 */
export async function startSync(config: FirebaseWebConfig, uid: string): Promise<boolean> {
  stopSync();
  setStatus({ state: "syncing" });
  try {
    // Let edits from the previous session finish uploading, so the pull below
    // never replaces newer local data with an older cloud copy
    await pending;
    if (dirtyOwner !== linkId(config, uid)) dirty.clear(); // failed edits from another account
    const remote = await fetchRemote(config, uid);
    let changed = false;
    suppress = true;
    try {
      // Edits that still failed to upload keep their local value
      for (const key of localAppKeys()) {
        if (dirty.has(key)) continue;
        if (!remote.has(key)) { localStorage.removeItem(key); changed = true; }
      }
      for (const [key, value] of remote) {
        if (dirty.has(key)) continue;
        if (localStorage.getItem(key) !== value) { localStorage.setItem(key, value); changed = true; }
      }
    } finally {
      suppress = false;
    }
    active = { config, uid };
    dirtyOwner = linkId(config, uid);
    patchStorage();
    window.addEventListener("pagehide", onPageHide);
    if (dirty.size) timer = setTimeout(() => { void flush(); }, PUSH_DELAY_MS); // retry them
    setStatus({ state: "synced", at: Date.now() });
    return changed;
  } catch (err) {
    setStatus({ state: "error", error: describeSyncError(err) });
    return false;
  }
}

export function stopSync() {
  if (timer) { clearTimeout(timer); timer = null; }
  void flush(); // upload pending edits instead of dropping them (e.g. when switching tabs)
  active = null;
  restore?.();
  window.removeEventListener("pagehide", onPageHide);
  if (status.state !== "off") setStatus({ state: "off" });
}

// ── Errors & setup help ────────────────────────────────────────────────────
export function describeSyncError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "permission-denied") return "Firestore blocked access. Paste the security rules below into Firestore → Rules and publish.";
  if (code === "not-found" || code === "failed-precondition") return "No Firestore database yet. Open Firebase console → Firestore Database → Create database.";
  if (code === "unavailable") return "Couldn't reach Firestore. Changes are kept and will retry on the next edit.";
  return `Sync failed${code ? ` (${code})` : ""}.`;
}

export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}`;
