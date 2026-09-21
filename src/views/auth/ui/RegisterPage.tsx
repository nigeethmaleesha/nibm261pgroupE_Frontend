import { AuthShell } from "@/src/shared/ui/AuthShell";
import { RegisterForm } from "@/src/widgets/auth/ui/RegisterForm";

export function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Customer registration"
      title="Create your account"
      // description="Enter your details to create a RepairFlow customer account. Your email must be verified before the account becomes active."
      // sideTitle="A professional customer portal built around repair clarity."
      // sideDescription="Register once, verify your email and use the same secure account for repair updates and estimate decisions."
      backHref="/login"
      backLabel="Back"
      wide
    >
      <RegisterForm />
    </AuthShell>
  );
}
