import type { Metadata } from "next";
import { OtpPage } from "@/src/views/auth/ui/OtpPage";

export const metadata: Metadata = { title: "Login verification" };

export default function Page() {
  return <OtpPage flow="LOGIN" />;
}
