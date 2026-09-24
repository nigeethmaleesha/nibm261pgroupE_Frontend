import type { Metadata } from "next";
import { CurrentEstimateLookupPage } from "@/src/views/estimates/ui/CurrentEstimateLookupPage";

export const metadata: Metadata = { title: "Current estimate" };

export default function Page() {
  return <CurrentEstimateLookupPage />;
}
