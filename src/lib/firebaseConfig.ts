/**
 * User-supplied Firebase web config ("bring your own Firebase").
 *
 * The web config (apiKey, projectId, …) is public by design — access is
 * enforced by the user's own Firebase Auth + Firestore security rules.
 * Service-account keys are secret and are explicitly rejected.
 *
 * Stored under bt_firebase_config, which budgetBackup's isAppKey does not
 * match, so it is never included in exported backups.
 */

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

const CONFIG_KEY = "bt_firebase_config";
const REQUIRED = ["apiKey", "authDomain", "projectId", "appId"] as const;
const OPTIONAL = ["storageBucket", "messagingSenderId"] as const;

export type ParseResult =
  | { ok: true; config: FirebaseWebConfig }
  | { ok: false; error: string };

/**
 * Accepts either JSON or the JS snippet the Firebase console shows:
 *   const firebaseConfig = { apiKey: "…", authDomain: "…", … };
 */
export function parseFirebaseConfig(input: string): ParseResult {
  const text = input.trim();
  if (!text) return { ok: false, error: "Paste your Firebase web app config." };

  if (/private_key|service_account/.test(text)) {
    return {
      ok: false,
      error: "This looks like a service-account key. Never paste that here — use the web app config from Project settings → Your apps.",
    };
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return { ok: false, error: "Couldn't find a { … } config object." };
  }

  // Quote bare keys, drop trailing commas, normalise single quotes → valid JSON
  const json = text
    .slice(start, end + 1)
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/'([^']*)'/g, '"$1"')
    .replace(/,\s*}/g, "}");

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "Couldn't read that config. Paste the whole firebaseConfig object." };
  }

  const missing = REQUIRED.filter((k) => typeof raw[k] !== "string" || !(raw[k] as string).trim());
  if (missing.length) {
    return { ok: false, error: `Missing: ${missing.join(", ")}.` };
  }
  if (!(raw.apiKey as string).startsWith("AIza")) {
    return { ok: false, error: "apiKey doesn't look like a Firebase web API key." };
  }

  // Keep only known fields
  const config = {} as FirebaseWebConfig;
  for (const k of [...REQUIRED, ...OPTIONAL]) {
    if (typeof raw[k] === "string") (config as unknown as Record<string, string>)[k] = (raw[k] as string).trim();
  }
  return { ok: true, config };
}

export function loadFirebaseConfig(): FirebaseWebConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = parseFirebaseConfig(raw);
    return parsed.ok ? parsed.config : null;
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseWebConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}
