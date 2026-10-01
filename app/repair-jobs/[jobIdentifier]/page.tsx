import type { Metadata } from "next";
import { RepairProgressPage } from "@/src/views/repair-jobs/ui/RepairProgressPage";

export const metadata: Metadata = { title: "Track Repair Progress" };

export default function Page() {
  return <RepairProgressPage />;
}
