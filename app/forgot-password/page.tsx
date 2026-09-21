import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/src/views/auth/ui/ForgotPasswordPage";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordPage />;
}
