import type { Metadata } from "next";
import { use } from "react";
import SavingsDetail from "./SavingsDetail";

export const metadata: Metadata = {
  title: "Savings Goal — Budget Engine",
  robots: { index: false, follow: false },
};

export default function SavingsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <SavingsDetail id={id} />;
}
