import { AuthShell } from "@/src/shared/ui/AuthShell";
import { ResetPasswordForm } from "@/src/widgets/auth/ui/ResetPasswordForm";

export function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Create new password"
      title="Choose a new password"
      backHref="/forgot-password"
      backLabel="Restart recovery"
      compact
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
