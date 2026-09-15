/**
 * Export all budget tracker data to a .json file download.
 * Import restores it from a user-selected file.
 *
 * Covered keys:
 *   bt_periods, bt_items_*         — pay periods & expenses
 *   bt_loans, bt_loan_payments_*   — loan repayment
 *   bt_savings, bt_savings_deposits_* — savings goals
 *   bt_currency                    — currency preference
 */

function isAppKey(k: string): boolean {
  return (
    k === "bt_periods"   ||
    k === "bt_loans"     ||
    k === "bt_savings"   ||
    k === "bt_currency"  ||
    k.startsWith("bt_items_")             ||
    k.startsWith("bt_loan_payments_")     ||
    k.startsWith("bt_savings_deposits_")
  );
}

function getAllAppKeys(): string[] {
  return Object.keys(localStorage).filter(isAppKey);
}

export function exportData(): void {
  const snapshot: Record<string, unknown> = {};
  for (const key of getAllAppKeys()) {
    try {
      snapshot[key] = JSON.parse(localStorage.getItem(key) ?? "null");
    } catch {
      snapshot[key] = null;
    }
  }

  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `budget-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw      = e.target?.result as string;
        const snapshot = JSON.parse(raw) as Record<string, unknown>;

        if (typeof snapshot !== "object" || snapshot === null) {
          throw new Error("Invalid backup file.");
        }

        // Only restore keys that belong to this app
        for (const [key, value] of Object.entries(snapshot)) {
          if (isAppKey(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}
