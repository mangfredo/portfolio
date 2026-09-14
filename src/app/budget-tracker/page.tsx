import type { Metadata } from "next";
import BudgetHome from "./BudgetHome";

export const metadata: Metadata = {
  title: "Budget Tracker",
  robots: { index: false, follow: false },
};

export default function BudgetTrackerPage() {
  return <BudgetHome />;
}
