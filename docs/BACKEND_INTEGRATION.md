# RepairFlow Frontend ↔ Backend Integration

## Why the frontend uses `/api`

The frontend uses:

```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_BASE_URL=http://localhost:5000/api
```

Browser request:

```text
http://localhost:3000/api/auth/login
```

Next.js `proxy.ts` forwards it server-side to:

```text
http://localhost:5000/api/auth/login
```

The proxy also forwards backend `Set-Cookie` headers and future browser Cookie headers. Access and refresh JWTs therefore remain in HttpOnly cookies and are never copied to localStorage/sessionStorage.

## Registration

```text
/register
  POST /auth/register
      ↓
/register/verify-otp
  POST /auth/register/verify-otp
      ↓
/login
```

Resend:

```text
POST /auth/register/resend-otp
```

Only pending email and OTP timing metadata are kept in `sessionStorage`. The OTP itself is never stored by the frontend.

## Login

```text
/login
  POST /auth/login
      ↓
/login/verify-otp
  POST /auth/login/verify-otp
      ↓
backend sets HttpOnly access + refresh cookies
      ↓
/dashboard
```

Resend:

```text
POST /auth/login/resend-otp
```

## Protected requests + refresh

The API client sends all requests with:

```text
credentials: include
```

When a protected request returns `401`, the client attempts:

```text
POST /auth/refresh-token
```

If refresh succeeds, the original protected request is retried once. If refresh is also rejected, the local authenticated user is cleared and protected routes return to login.

## Forgot password

```text
/forgot-password
  POST /auth/forgot-password/initiate
      ↓
/forgot-password/verify-otp
  POST /auth/forgot-password/verify-otp
      ↓
short-lived resetToken stored in sessionStorage
      ↓
/forgot-password/reset
  POST /auth/forgot-password/change
      ↓
/login
```

Resend:

```text
POST /auth/forgot-password/resend-otp
```

The reset token is intentionally stored only in tab-scoped `sessionStorage`, not persistent `localStorage`, and is deleted after a successful password change.

## Dashboard/current-estimate dependency

The dashboard authenticates against `GET /auth/me`. Repair-job and estimate data are not mocked as real records. When the team's job/estimate endpoints are finalized, connect them through new functions in `src/shared/api/` and render them in the dashboard widgets without changing the authentication layer.
