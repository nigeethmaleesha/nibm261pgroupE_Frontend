"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { loginCustomer } from "@/src/shared/api/auth.api";
import { ApiError } from "@/src/shared/api/http";
import { savePendingOtp } from "@/src/shared/auth/pendingAuth";
import { EMAIL_REGEX, normalizeEmail } from "@/src/shared/lib/validation";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const cleanEmail = normalizeEmail(email);
    setError(null);

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await loginCustomer({ email: cleanEmail, password });

      savePendingOtp({
        email: response.email || cleanEmail,
        flow: "LOGIN",
        otpExpiresInSeconds: response.otpExpiresInSeconds,
        resendAvailableInSeconds: response.resendAvailableInSeconds,
      });

      toast.info("Password accepted. We sent a 6-digit login code to your email.");
      router.push("/login/verify-otp");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to sign in right now. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}

      <FormField
        label="Email address"
        name="email"
        type="email"
        value={email}
        autoComplete="email"
        autoFocus
        required
        disabled={isLoading}
        placeholder="you@example.com"
        icon={<Mail className="h-[18px] w-[18px]" />}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
      />

      <div className="space-y-1.5">
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          autoComplete="current-password"
          required
          disabled={isLoading}
          placeholder="Enter your password"
          icon={<LockKeyhole className="h-[18px] w-[18px]" />}
          passwordToggle
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError(null);
          }}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[12px] font-extrabold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <PrimaryButton type="submit" loading={isLoading}>
        Continue securely
      </PrimaryButton>

      <div className="flex items-center gap-3 py-0.5">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          New customer?
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <Link
        href="/register"
        className="flex h-[46px] items-center justify-center rounded-[14px] border border-blue-200 bg-blue-50/70 text-sm font-extrabold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
      >
        Create a RepairFlow account
      </Link>
    </form>
  );
}
