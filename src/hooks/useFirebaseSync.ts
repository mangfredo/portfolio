"use client";

import { useEffect, useRef } from "react";
import { loadFirebaseConfig } from "@/lib/firebaseConfig";
import { watchFirebaseUser } from "@/lib/firebaseClient";
import { isLinked, startSync, stopSync, SYNC_LINKED_EVENT } from "@/lib/firebaseSync";

/**
 * Runs Firestore sync for the whole LaanFlow shell.
 * Starts only when a Firebase config is saved, the user is signed in, and they
 * have linked this browser (picked upload/download in the Storage dialog).
 * Re-evaluates whenever the dialog links, signs out, or disconnects.
 */
export function useFirebaseSync(onPulled: () => void) {
  const onPulledRef = useRef(onPulled);
  useEffect(() => { onPulledRef.current = onPulled; });

  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let cancelled = false;
    let run = 0;

    async function evaluate() {
      const myRun = ++run;
      unsubAuth?.();
      unsubAuth = undefined;
      stopSync();

      const config = loadFirebaseConfig();
      if (!config) return; // no Firebase configured — never loads the SDK

      const unsub = await watchFirebaseUser(config, async (user) => {
        if (!user || !isLinked(config, user.uid)) { stopSync(); return; }
        const changed = await startSync(config, user.uid);
        if (changed && myRun === run) onPulledRef.current();
      });
      if (cancelled || myRun !== run) unsub();
      else unsubAuth = unsub;
    }

    void evaluate().catch(() => { /* status already reported by the sync module */ });
    const onLinked = () => { void evaluate().catch(() => {}); };
    window.addEventListener(SYNC_LINKED_EVENT, onLinked);
    return () => {
      cancelled = true;
      window.removeEventListener(SYNC_LINKED_EVENT, onLinked);
      unsubAuth?.();
      stopSync();
    };
  }, []);
}
