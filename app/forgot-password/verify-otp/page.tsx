import type { Metadata } from "next";
import { OtpPage } from "@/src/views/auth/ui/OtpPage";

export const metadata: Metadata = { title: "Recovery verification" };

export default function Page() {
  return <OtpPage flow="FORGOT_PASSWORD" />;
}
