import type { Metadata } from "next";
import { RegisterPage } from "@/src/views/auth/ui/RegisterPage";

export const metadata: Metadata = { title: "Register" };

export default function Page() {
  return <RegisterPage />;
}
