# RepairFlow Frontend

Customer-facing frontend for the NIBM Agile coursework RepairFlow project.

## Implemented now

- Customer registration with frontend validation
- Registration OTP verification and resend cooldown
- Customer login with email/password
- Login OTP verification and resend cooldown
- Forgot password initiation
- Forgot password OTP verification + resend
- New-password screen using the backend reset token
- HttpOnly access/refresh cookie integration
- Automatic access-token refresh for protected API requests
- Protected customer dashboard
- Secure logout
- Responsive blue/white RepairFlow UI and vector brand mark
- Same-origin Next.js API proxy to avoid browser CORS/cookie problems during local development

The repair-job/current-estimate data area is intentionally a backend-ready placeholder because those API contracts are owned by other coursework modules and should not be guessed.

## Tech stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- Lucide icons
- Express/MongoDB backend through `/api` proxy

## Run locally

1. Start the RepairFlow backend on `http://localhost:5000`.
2. Confirm the frontend `.env` contains:

```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_BASE_URL=http://localhost:5000/api
```

3. Install and run:

```bash
npm install
npm run dev
```

4. Open `http://localhost:3000`.

Because the browser calls the Next.js `/api` proxy instead of the Express server directly, the frontend works with the backend HttpOnly cookies without exposing JWTs to JavaScript. This also means local browser CORS configuration is not required for normal frontend use.

## Main routes

- `/login`
- `/login/verify-otp`
- `/register`
- `/register/verify-otp`
- `/forgot-password`
- `/forgot-password/verify-otp`
- `/forgot-password/reset`
- `/dashboard`

## Backend endpoints used

- `POST /api/auth/register`
- `POST /api/auth/register/verify-otp`
- `POST /api/auth/register/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/login/verify-otp`
- `POST /api/auth/login/resend-otp`
- `POST /api/auth/forgot-password/initiate`
- `POST /api/auth/forgot-password/resend-otp`
- `POST /api/auth/forgot-password/verify-otp`
- `POST /api/auth/forgot-password/change`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`

See `docs/BACKEND_INTEGRATION.md` for the full flow.
