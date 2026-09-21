import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/shared/auth/AuthProvider";
import { ToastProvider } from "@/src/shared/ui/ToastProvider";

export const metadata: Metadata = {
  title: {
    default: "RepairFlow",
    template: "%s | RepairFlow",
  },
  description: "Secure repair-service customer portal for RepairFlow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
