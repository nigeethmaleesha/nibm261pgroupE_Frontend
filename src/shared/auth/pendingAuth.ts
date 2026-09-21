export type PendingOtpFlow = "REGISTER" | "LOGIN" | "FORGOT_PASSWORD";

type PendingOtpState = {
  email: string;
  flow: PendingOtpFlow;
  expiresAt: number;
  resendAt: number;
};

const OTP_KEY = "repairflow_pending_otp";
const RESET_TOKEN_KEY = "repairflow_password_reset_token";

export function savePendingOtp(input: {
  email: string;
  flow: PendingOtpFlow;
  otpExpiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const state: PendingOtpState = {
    email: input.email,
    flow: input.flow,
    expiresAt: now + Math.max(1, input.otpExpiresInSeconds ?? 600) * 1000,
    resendAt: now + Math.max(0, input.resendAvailableInSeconds ?? 60) * 1000,
  };

  sessionStorage.setItem(OTP_KEY, JSON.stringify(state));
}

export function readPendingOtp(expectedFlow?: PendingOtpFlow): PendingOtpState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw) as PendingOtpState;
    if (!state.email || !state.flow) return null;
    if (expectedFlow && state.flow !== expectedFlow) return null;
    return state;
  } catch {
    return null;
  }
}

export function updatePendingOtpTiming(input: {
  otpExpiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}) {
  const current = readPendingOtp();
  if (!current || typeof window === "undefined") return;

  const now = Date.now();
  sessionStorage.setItem(
    OTP_KEY,
    JSON.stringify({
      ...current,
      expiresAt: now + Math.max(1, input.otpExpiresInSeconds ?? 600) * 1000,
      resendAt: now + Math.max(0, input.resendAvailableInSeconds ?? 60) * 1000,
    } satisfies PendingOtpState),
  );
}

export function clearPendingOtp() {
  if (typeof window !== "undefined") sessionStorage.removeItem(OTP_KEY);
}

export function savePasswordResetToken(token: string) {
  if (typeof window !== "undefined") sessionStorage.setItem(RESET_TOKEN_KEY, token);
}

export function readPasswordResetToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(RESET_TOKEN_KEY);
}

export function clearPasswordResetToken() {
  if (typeof window !== "undefined") sessionStorage.removeItem(RESET_TOKEN_KEY);
}
