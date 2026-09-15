/**
 * Export all budget tracker data to a .json file download.
 * Import restores it from a user-selected file.
 */

const PERIODS_KEY = "bt_periods";

function getAllKeys(): string[] {
  return Object.keys(localStorage).filter(
    (k) => k === PERIODS_KEY || k.startsWith("bt_items_")
  );
}

export function exportData(): void {
  const snapshot: Record<string, unknown> = {};
  for (const key of getAllKeys()) {
    try {
      snapshot[key] = JSON.parse(localStorage.getItem(key) ?? "null");
    } catch {
      snapshot[key] = null;
    }
  }

  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const a = document.createElement("a");
  a.href = url;
  a.download = `budget-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const snapshot = JSON.parse(raw) as Record<string, unknown>;

        // Validate it looks like budget data
        if (typeof snapshot !== "object" || snapshot === null) {
          throw new Error("Invalid backup file.");
        }

        // Restore — only write keys that belong to this app
        for (const [key, value] of Object.entries(snapshot)) {
          if (key === PERIODS_KEY || key.startsWith("bt_items_")) {
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
