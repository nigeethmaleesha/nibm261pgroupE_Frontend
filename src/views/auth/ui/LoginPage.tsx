import { AuthShell } from "@/src/shared/ui/AuthShell";
import { LoginForm } from "@/src/widgets/auth/ui/LoginForm";

export function LoginPage() {
  return (
    <AuthShell title="Welcome back" compact>
      <LoginForm />
    </AuthShell>
  );
}
