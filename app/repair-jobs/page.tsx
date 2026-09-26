import type { Metadata } from "next";
import { MyRepairJobsPage } from "@/src/views/repair-jobs/ui/MyRepairJobsPage";

export const metadata: Metadata = { title: "My repair jobs" };

export default function Page() {
  return <MyRepairJobsPage />;
}
