import type { Metadata } from "next";
import { use } from "react";
import PeriodDetail from "./PeriodDetail";

export const metadata: Metadata = {
  title: "Budget Tracker",
  robots: { index: false, follow: false },
};

export default function PeriodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PeriodDetail id={id} />;
}
