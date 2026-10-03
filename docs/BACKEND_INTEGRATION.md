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

## Dashboard & Completed Repair Records (SCRUM-125)

The dashboard authenticates against `GET /auth/me`. Active jobs are retrieved from `GET /customer/my-jobs`, and past completed repairs are fetched from `GET /customer/jobs/history`:

```text
GET /customer/jobs/history
Accept: application/json
Credentials: include (HttpOnly session cookies)
```

The response provides all completed repair records with:
- `reference`, `device` (brand, model, serialNumber), `reportedFault`
- `status` ("Collected")
- `outcome` ("repaired" | "unrepaired") & `outcomeDisplay`
- `outcomeDescription`
- `collectedAt` / `collectionTime`
- `publicRepairSummary` (or `returnReason` / `returnNotes`)
- `latestEstimate` & `estimateHistory` with itemized amounts breakdown and customer decision details

