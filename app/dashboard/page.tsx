import type { Metadata } from "next";
import { CustomerDashboardPage } from "@/src/views/dashboard/ui/CustomerDashboardPage";

export const metadata: Metadata = { title: "Customer dashboard" };

export default function Page() {
  return <CustomerDashboardPage />;
}
