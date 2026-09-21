import { requestJson } from "./http";
import type {
  ForgotPasswordVerifyResponse,
  MeResponse,
  MessageResponse,
  OtpStartResponse,
  VerifyLoginResponse,
  VerifyRegistrationResponse,
} from "@/src/shared/types/auth";

const post = <T>(path: string, body: unknown) =>
  requestJson<T>(
    path,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { skipRefresh: true },
  );

export function registerCustomer(payload: {
  fullName: string;
  email: string;
  contactNumber: string;
  password: string;
}) {
  return post<OtpStartResponse>("/auth/register", payload);
}

export function verifyRegistrationOtp(payload: { email: string; otp: string }) {
  return post<VerifyRegistrationResponse>("/auth/register/verify-otp", payload);
}

export function resendRegistrationOtp(payload: { email: string }) {
  return post<OtpStartResponse>("/auth/register/resend-otp", payload);
}

export function loginCustomer(payload: { email: string; password: string }) {
  return post<OtpStartResponse>("/auth/login", payload);
}

export function verifyLoginOtp(payload: { email: string; otp: string }) {
  return post<VerifyLoginResponse>("/auth/login/verify-otp", payload);
}

export function resendLoginOtp(payload: { email: string }) {
  return post<OtpStartResponse>("/auth/login/resend-otp", payload);
}

export function initiateForgotPassword(payload: { email: string }) {
  return post<OtpStartResponse>("/auth/forgot-password/initiate", payload);
}

export function resendForgotPasswordOtp(payload: { email: string }) {
  return post<OtpStartResponse>("/auth/forgot-password/resend-otp", payload);
}

export function verifyForgotPasswordOtp(payload: { email: string; otp: string }) {
  return post<ForgotPasswordVerifyResponse>("/auth/forgot-password/verify-otp", payload);
}

export function changeForgottenPassword(payload: {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return post<MessageResponse>("/auth/forgot-password/change", payload);
}

export function getCurrentCustomer() {
  return requestJson<MeResponse>("/auth/me", { method: "GET" });
}
