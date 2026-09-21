"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { changeForgottenPassword } from "@/src/shared/api/auth.api";
import { ApiError } from "@/src/shared/api/http";
import { clearPasswordResetToken, readPasswordResetToken } from "@/src/shared/auth/pendingAuth";
import { FormField } from "@/src/shared/ui/FormField";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { PasswordStrength } from "@/src/shared/ui/PasswordStrength";
import { PrimaryButton } from "@/src/shared/ui/PrimaryButton";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function ResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = readPasswordResetToken();
    if (!token) {
      router.replace("/forgot-password");
      return;
    }
    setResetToken(token);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetToken || isLoading) return;

    setError(null);

    if (password.length < 12) {
      setError("Your new password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await changeForgottenPassword({
        resetToken,
        newPassword: password,
        confirmPassword,
      });

      clearPasswordResetToken();
      toast.success(response.message || "Password changed successfully.");
      router.replace("/login");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to change your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="space-y-2">
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          value={password}
          autoComplete="new-password"
          autoFocus
          required
          disabled={isLoading}
          placeholder="Minimum 12 characters"
          icon={<LockKeyhole className="h-[18px] w-[18px]" />}
          passwordToggle
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError(null);
          }}
        />
        <PasswordStrength password={password} />
      </div>

      <FormField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        autoComplete="new-password"
        required
        disabled={isLoading}
        placeholder="Re-enter the new password"
        icon={<LockKeyhole className="h-[18px] w-[18px]" />}
        passwordToggle
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          if (error) setError(null);
        }}
      />

      <PrimaryButton type="submit" loading={isLoading}>
        Update password
      </PrimaryButton>
    </form>
  );
}
