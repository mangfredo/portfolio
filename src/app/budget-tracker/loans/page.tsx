import type { Metadata } from "next";
import LoansHome from "./LoansHome";

export const metadata: Metadata = {
  title: "Loan Repayment — Budget Engine",
  robots: { index: false, follow: false },
};

export default function LoansPage() {
  return <LoansHome />;
}
