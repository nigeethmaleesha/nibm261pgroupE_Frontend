"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { initiateForgotPassword } from "@/src/shared/api/auth.api";
import { ApiError } from "@/src/shared/api/http";
import { savePendingOtp } from "@/src/shared/auth/pendingAuth";
import { EMAIL_REGEX, normalizeEmail } from "@/src/shared/lib/validation";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function ForgotPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
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

    try {
      setIsLoading(true);
      const response = await initiateForgotPassword({ email: cleanEmail });

      savePendingOtp({
        email: cleanEmail,
        flow: "FORGOT_PASSWORD",
        otpExpiresInSeconds: response.otpExpiresInSeconds,
        resendAvailableInSeconds: response.resendAvailableInSeconds,
      });

      toast.info("If that verified customer account exists, a reset code has been sent.");
      router.push("/forgot-password/verify-otp");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to start password recovery. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}

      <FormField
        label="Account email"
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

      <PrimaryButton type="submit" loading={isLoading}>
        Send reset code
      </PrimaryButton>
    </form>
  );
}
