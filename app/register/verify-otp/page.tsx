import type { Metadata } from "next";
import { OtpPage } from "@/src/views/auth/ui/OtpPage";

export const metadata: Metadata = { title: "Registration verification" };

export default function Page() {
  return <OtpPage flow="REGISTER" />;
}
