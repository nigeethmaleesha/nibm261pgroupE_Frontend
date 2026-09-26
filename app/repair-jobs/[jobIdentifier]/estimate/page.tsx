import type { Metadata } from "next";
import { CurrentEstimatePage } from "@/src/views/estimates/ui/CurrentEstimatePage";

export const metadata: Metadata = { title: "Repair estimate" };

export default function Page() {
  return <CurrentEstimatePage />;
}
