import type { Metadata } from "next";
import { ResetPasswordPage } from "@/src/views/auth/ui/ResetPasswordPage";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return <ResetPasswordPage />;
}
