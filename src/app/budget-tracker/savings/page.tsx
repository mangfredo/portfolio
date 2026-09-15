import type { Metadata } from "next";
import SavingsHome from "./SavingsHome";

export const metadata: Metadata = {
  title: "Savings Goals — Budget Engine",
  robots: { index: false, follow: false },
};

export default function SavingsPage() {
  return <SavingsHome />;
}
