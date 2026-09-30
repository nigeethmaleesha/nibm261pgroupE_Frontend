import type { Metadata } from "next";
import { RepairProgressPage } from "@/src/views/repair-jobs/ui/RepairProgressPage";

export const metadata: Metadata = { title: "Repair progress" };

export default function Page() {
  return <RepairProgressPage />;
}
