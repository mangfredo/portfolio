/**
 * Lazy Firebase client for "bring your own Firebase".
 *
 * The SDK is loaded with dynamic import() only when a user has saved a config,
 * so visitors who never enable it don't download Firebase.
 * One named app instance ("laanflow") is reused; it is rebuilt if the
 * saved config changes.
 */

import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseWebConfig } from "./firebaseConfig";

const APP_NAME = "laanflow";

let current: { key: string; app: FirebaseApp; auth: Auth } | null = null;

export interface FirebaseUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
}

function toInfo(u: User | null): FirebaseUserInfo | null {
  return u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null;
}

async function getAuthFor(config: FirebaseWebConfig): Promise<Auth> {
  const key = JSON.stringify(config);
  if (current?.key === key) return current.auth;

  const [{ initializeApp, deleteApp, getApps }, { getAuth }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);

  // Config changed (or first load) — drop any previous instance
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) await deleteApp(existing);

  const app = initializeApp(config, APP_NAME);
  const auth = getAuth(app);
  current = { key, app, auth };
  return auth;
}

/** Firestore for the saved project (shares the same app instance as auth). */
export async function getFirestoreFor(config: FirebaseWebConfig): Promise<Firestore> {
  await getAuthFor(config);
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(current!.app);
}

/** Subscribe to sign-in state. Returns an unsubscribe function. */
export async function watchFirebaseUser(
  config: FirebaseWebConfig,
  onChange: (user: FirebaseUserInfo | null) => void,
): Promise<() => void> {
  const auth = await getAuthFor(config);
  const { onAuthStateChanged } = await import("firebase/auth");
  return onAuthStateChanged(auth, (u) => onChange(toInfo(u)));
}

export async function signInWithGoogle(config: FirebaseWebConfig): Promise<FirebaseUserInfo> {
  const auth = await getAuthFor(config);
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return toInfo(result.user)!;
}

export async function signOutFirebase(): Promise<void> {
  if (!current) return;
  const { signOut } = await import("firebase/auth");
  await signOut(current.auth);
}

/** Sign out and tear down the app instance (used on Disconnect). */
export async function disposeFirebase(): Promise<void> {
  if (!current) return;
  const { deleteApp } = await import("firebase/app");
  const { signOut } = await import("firebase/auth");
  try { await signOut(current.auth); } catch { /* already signed out */ }
  await deleteApp(current.app);
  current = null;
}

/** Map Firebase auth errors to setup guidance the user can act on. */
export function describeAuthError(err: unknown): string | null {
  const code = (err as { code?: string })?.code ?? "";
  const host = typeof window !== "undefined" ? window.location.hostname : "this site";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null; // user dismissed — not an error
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/unauthorized-domain":
      return `Add "${host}" in Firebase console → Authentication → Settings → Authorized domains.`;
    case "auth/operation-not-allowed":
      return "Enable Google in Firebase console → Authentication → Sign-in method.";
    case "auth/configuration-not-found":
      return "Authentication isn't set up yet. Open Firebase console → Authentication → Get started.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Firebase rejected the apiKey. Re-copy the config from Project settings → Your apps.";
    case "auth/network-request-failed":
      return "Couldn't reach Firebase. Check your connection and try again.";
    default:
      return `Sign-in failed${code ? ` (${code})` : ""}.`;
  }
}
