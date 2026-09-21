"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { registerCustomer } from "@/src/shared/api/auth.api";
import { ApiError } from "@/src/shared/api/http";
import { savePendingOtp } from "@/src/shared/auth/pendingAuth";
import { EMAIL_REGEX, isValidContactNumber, normalizeEmail } from "@/src/shared/lib/validation";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PasswordStrength } from "@/src/shared/ui/PasswordStrength";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

type Errors = Partial<Record<"fullName" | "email" | "contactNumber" | "password" | "confirmPassword", string>>;

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    if (error) setError(null);
  };

  const validate = () => {
    const next: Errors = {};
    const email = normalizeEmail(form.email);

    if (form.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!EMAIL_REGEX.test(email)) next.email = "Enter a valid email address.";
    if (!isValidContactNumber(form.contactNumber)) {
      next.contactNumber = "Enter a valid contact number (7–15 digits).";
    }
    if (form.password.length < 12) next.password = "Password must contain at least 12 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !validate()) return;

    const cleanEmail = normalizeEmail(form.email);

    try {
      setIsLoading(true);
      const response = await registerCustomer({
        fullName: form.fullName.trim(),
        email: cleanEmail,
        contactNumber: form.contactNumber.trim(),
        password: form.password,
      });

      savePendingOtp({
        email: response.email || cleanEmail,
        flow: "REGISTER",
        otpExpiresInSeconds: response.otpExpiresInSeconds,
        resendAvailableInSeconds: response.resendAvailableInSeconds,
      });

      toast.info("Registration details saved. Verify the code sent to your email.");
      router.push("/register/verify-otp");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to create your account right now. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Full name"
          name="fullName"
          value={form.fullName}
          autoComplete="name"
          autoFocus
          required
          disabled={isLoading}
          placeholder="Your full name"
          icon={<UserRound className="h-[18px] w-[18px]" />}
          error={fieldErrors.fullName}
          onChange={(event) => update("fullName", event.target.value)}
        />
        <FormField
          label="Contact number"
          name="contactNumber"
          type="tel"
          value={form.contactNumber}
          autoComplete="tel"
          required
          disabled={isLoading}
          placeholder="077 123 4567"
          icon={<Phone className="h-[18px] w-[18px]" />}
          error={fieldErrors.contactNumber}
          onChange={(event) => update("contactNumber", event.target.value)}
        />
      </div>

      <FormField
        label="Email address"
        name="email"
        type="email"
        value={form.email}
        autoComplete="email"
        required
        disabled={isLoading}
        placeholder="you@example.com"
        icon={<Mail className="h-[18px] w-[18px]" />}
        error={fieldErrors.email}
        onChange={(event) => update("email", event.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            autoComplete="new-password"
            required
            disabled={isLoading}
            placeholder="Minimum 12 characters"
            icon={<LockKeyhole className="h-[18px] w-[18px]" />}
            error={fieldErrors.password}
            passwordToggle
            onChange={(event) => update("password", event.target.value)}
          />
          <PasswordStrength password={form.password} />
        </div>
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          autoComplete="new-password"
          required
          disabled={isLoading}
          placeholder="Re-enter password"
          icon={<LockKeyhole className="h-[18px] w-[18px]" />}
          error={fieldErrors.confirmPassword}
          passwordToggle
          onChange={(event) => update("confirmPassword", event.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/65 px-4 py-3 text-[12px] font-semibold leading-5 text-slate-600">
        Your account is created as a <span className="font-extrabold text-blue-700">Customer</span>. Staff and technician roles cannot be selected during public registration.
      </div>

      <PrimaryButton type="submit" loading={isLoading}>
        Create account
      </PrimaryButton>

      <p className="text-center text-[13px] font-semibold text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
