import { AuthShell } from "@/src/shared/ui/AuthShell";
import type { PendingOtpFlow } from "@/src/shared/auth/pendingAuth";
import { OtpVerificationForm } from "@/src/widgets/auth/ui/OtpVerificationForm";

const COPY: Record<PendingOtpFlow, { title: string; backHref: string }> = {
  REGISTER: {
    title: "Verify your email",
    backHref: "/register",
  },
  LOGIN: {
    title: "Confirm it’s you",
    backHref: "/login",
  },
  FORGOT_PASSWORD: {
    title: "Verify recovery code",
    backHref: "/forgot-password",
  },
};

export function OtpPage({ flow }: { flow: PendingOtpFlow }) {
  const copy = COPY[flow];

  return (
    <AuthShell
      eyebrow="OTP verification"
      title={copy.title}
      backHref={copy.backHref}
      backLabel="Back"
      compact
    >
      <OtpVerificationForm flow={flow} />
    </AuthShell>
  );
}
