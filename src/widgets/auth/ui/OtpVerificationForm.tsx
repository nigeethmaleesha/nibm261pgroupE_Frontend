"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import {
  resendForgotPasswordOtp,
  resendLoginOtp,
  resendRegistrationOtp,
  verifyForgotPasswordOtp,
  verifyLoginOtp,
  verifyRegistrationOtp,
} from "@/src/shared/api/auth.api";
import { ApiError } from "@/src/shared/api/http";
import { useAuth } from "@/src/shared/auth/AuthProvider";
import {
  clearPendingOtp,
  readPendingOtp,
  savePasswordResetToken,
  updatePendingOtpTiming,
  type PendingOtpFlow,
} from "@/src/shared/auth/pendingAuth";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { OtpInput } from "@/src/shared/ui/OtpInput";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

const FLOW_COPY: Record<PendingOtpFlow, { startHref: string }> = {
  REGISTER: { startHref: "/register" },
  LOGIN: { startHref: "/login" },
  FORGOT_PASSWORD: { startHref: "/forgot-password" },
};

function formatSeconds(value: number) {
  const safe = Math.max(0, value);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function OtpVerificationForm({ flow }: { flow: PendingOtpFlow }) {
  const router = useRouter();
  const toast = useToast();
  const { setAuthenticatedUser } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  const copy = FLOW_COPY[flow];

  useEffect(() => {
    const pending = readPendingOtp(flow);

    if (!pending) {
      router.replace(copy.startHref);
      return;
    }

    setEmail(pending.email);
    setExpiresAt(pending.expiresAt);
    setResendAt(pending.resendAt);
  }, [copy.startHref, flow, router]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const expirySeconds = useMemo(
    () => Math.max(0, Math.ceil((expiresAt - now) / 1000)),
    [expiresAt, now],
  );
  const resendSeconds = useMemo(
    () => Math.max(0, Math.ceil((resendAt - now) / 1000)),
    [resendAt, now],
  );

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !email) return;

    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the complete 6-digit OTP.");
      return;
    }

    if (expirySeconds <= 0) {
      setError("This code has expired. Request a new OTP to continue.");
      return;
    }

    try {
      setIsLoading(true);

      if (flow === "REGISTER") {
        const response = await verifyRegistrationOtp({ email, otp });
        clearPendingOtp();
        toast.success(response.message || "Registration completed successfully.");
        router.replace("/login");
        return;
      }

      if (flow === "LOGIN") {
        const response = await verifyLoginOtp({ email, otp });
        clearPendingOtp();
        setAuthenticatedUser(response.user);
        toast.success("Welcome back. Your secure session is ready.");
        router.replace("/dashboard");
        return;
      }

      const response = await verifyForgotPasswordOtp({ email, otp });
      clearPendingOtp();
      savePasswordResetToken(response.resetToken);
      toast.success("Code verified. You can now create a new password.");
      router.replace("/forgot-password/reset");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to verify the OTP. Please try again.",
      );
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendSeconds > 0 || isResending) return;

    setError(null);

    try {
      setIsResending(true);
      const response =
        flow === "REGISTER"
          ? await resendRegistrationOtp({ email })
          : flow === "LOGIN"
            ? await resendLoginOtp({ email })
            : await resendForgotPasswordOtp({ email });

      updatePendingOtpTiming({
        otpExpiresInSeconds: response.otpExpiresInSeconds,
        resendAvailableInSeconds: response.resendAvailableInSeconds,
      });

      const pending = readPendingOtp(flow);
      if (pending) {
        setExpiresAt(pending.expiresAt);
        setResendAt(pending.resendAt);
      }

      setOtp("");
      toast.success("A new OTP has been sent to your email.");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to resend the OTP right now.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2}).*(@.*)$/, "$1••••••$2")
    : "your email";

  return (
    <form onSubmit={handleVerify} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}

      <p className="text-center text-[13px] font-semibold text-slate-500">
        Code sent to <span className="font-extrabold text-slate-800">{maskedEmail}</span>
      </p>

      <OtpInput
        value={otp}
        onChange={(value) => {
          setOtp(value);
          if (error) setError(null);
        }}
        disabled={isLoading}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px] font-bold text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-blue-500" />
          {expirySeconds > 0 ? formatSeconds(expirySeconds) : "Code expired"}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendSeconds > 0 || isResending}
          className="inline-flex items-center gap-1.5 text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
          {isResending
            ? "Sending..."
            : resendSeconds > 0
              ? `Resend in ${resendSeconds}s`
              : "Resend OTP"}
        </button>
      </div>

      <PrimaryButton
        type="submit"
        loading={isLoading}
        disabled={otp.length !== 6 || expirySeconds <= 0}
      >
        Verify code
      </PrimaryButton>
    </form>
  );
}
