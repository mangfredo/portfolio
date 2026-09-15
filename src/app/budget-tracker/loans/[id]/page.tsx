import type { Metadata } from "next";
import { use } from "react";
import LoanDetail from "./LoanDetail";

export const metadata: Metadata = {
  title: "Loan Detail — Budget Engine",
  robots: { index: false, follow: false },
};

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <LoanDetail id={id} />;
}
