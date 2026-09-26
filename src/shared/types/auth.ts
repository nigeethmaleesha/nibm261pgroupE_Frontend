export type Customer = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  role: "customer" | string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OtpStartResponse = {
  message: string;
  requiresOtp?: boolean;
  email?: string;
  otpPurpose?: "REGISTER" | "LOGIN" | "FORGOT_PASSWORD";
  otpExpiresInSeconds?: number;
  resendAvailableInSeconds?: number;
};

export type VerifyRegistrationResponse = {
  message: string;
  user: Customer;
};

export type VerifyLoginResponse = {
  message: string;
  user: Customer;
  tokenStorage?: "httpOnly_cookies" | string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresIn?: string;
};

export type MeResponse = {
  user: Customer;
};

export type ForgotPasswordVerifyResponse = {
  message: string;
  resetToken: string;
  resetTokenExpiresIn?: string;
};

export type MessageResponse = {
  message: string;
};
