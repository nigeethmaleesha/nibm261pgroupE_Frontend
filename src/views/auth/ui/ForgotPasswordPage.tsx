import { AuthShell } from "@/src/shared/ui/AuthShell";
import { ForgotPasswordForm } from "@/src/widgets/auth/ui/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      backHref="/login"
      backLabel="Back"
      compact
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
