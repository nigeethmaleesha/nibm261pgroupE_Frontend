# RepairFlow Frontend

Customer-facing frontend for the NIBM Agile coursework RepairFlow project.

## Implemented Features

- Customer registration with frontend validation
- Registration OTP verification and resend cooldown
- Customer login with email/password
- Login OTP verification and resend cooldown
- Forgot password initiation
- Forgot password OTP verification + resend
- New-password screen using the backend reset token
- HttpOnly access/refresh cookie integration
- Automatic access-token refresh for protected API requests
- Protected customer dashboard with multi-tab workspace
- Secure logout
- Responsive blue/white RepairFlow UI and vector brand mark
- Same-origin Next.js API proxy to avoid browser CORS/cookie problems during local development
- **Repair Estimate Lookup** (`/repair-jobs/estimate`) for searching repair jobs by reference
- **Current Repair Job Estimate Review & Decision Portal** (`/repair-jobs/[jobIdentifier]/estimate`):
  - Live Repair Job Estimate UI with hardware metadata and technician intake diagnostic callout box
  - Estimate versioning metrics (Version, Issued Timestamp, Estimate Total)
  - Proposed Scope of Work pills & Itemised amounts breakdown table with warranty details
  - Dark Navy status & final estimated total summary bar
  - Customer decision authorization banner (**Approve Estimate** / **Reject / Request Revision**)
  - PDF export & printing capability
  - Service Helpline integration and 4 Trust Guarantee badges (90-Day Warranty, OEM Grade Quality, No Hidden Fees, Express Turnaround)
- **Customer Completed Repair Records & "Past Repairs" Tab (SCRUM-125)**:
  - **Dedicated "Past Repairs" Dashboard Tab**: Easily accessible directly within `/dashboard` (or via `/dashboard?tab=past-repairs` and through the "Completed repairs" stat card)
  - **Real-Time Search & Filters**: Search past jobs instantly by reference code (`JOB-202610-0001`), device make/model, serial number, reported fault, or resolution summary. Filter by repair outcome (**All Records**, **Repaired**, **Unrepaired**).
  - **Read-Only Summary Cards**:
    - **Outcome Badges**: Distinct visual badges distinguishing successfully **Repaired** devices (with 90-day parts & service warranty badge) vs **Unrepaired** returned devices.
    - **Collection Receipt Details**: Verified handover timestamp, hardware details, reported issue, technician resolution work summary, and return release notes.
    - **Settlement & Itemized Receipt**: Total paid/settled amount, customer authorization status and date, plus toggleable itemized parts and labour breakdown table.
    - **Convenience Actions**: One-click reference copy with visual confirmation, printable collection receipt layout (`window.print()`), and link to estimate history.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons
- **Authentication**: JWT with HttpOnly Refresh Cookies & Access Token auto-rotation
- **Backend API Proxy**: Express/MongoDB backend proxy via `/api`

## Run Locally

1. Start the RepairFlow backend on `http://localhost:5000`.
2. Confirm the frontend `.env` contains:

```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_BASE_URL=http://localhost:5000/api
```

3. Install dependencies and run development server:

```bash
npm install
npm run dev
```

4. Open `http://localhost:3000`.

Because the browser calls the Next.js `/api` proxy instead of the Express server directly, the frontend works with the backend HttpOnly cookies without exposing JWTs to JavaScript. This also means local browser CORS configuration is not required for normal frontend use.

## Main Routes

- `/login` — Customer login
- `/login/verify-otp` — Login 2FA verification
- `/register` — Customer registration
- `/register/verify-otp` — Registration email verification
- `/forgot-password` — Password reset initiation
- `/forgot-password/verify-otp` — Password reset OTP verification
- `/forgot-password/reset` — Set new password
- `/dashboard` — Protected customer dashboard (Overview & Past Repairs tabs)
- `/repair-jobs` — Customer active repair jobs list
- `/repair-jobs/estimate` — Repair estimate reference lookup
- `/repair-jobs/[jobIdentifier]/estimate` — Customer current estimate review & decision portal
- `/repair-jobs/[jobIdentifier]/progress` — Real-time repair progress timeline

## Backend Endpoints Used

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
- `GET /api/customer/my-jobs`
- `GET /api/customer/jobs/history` (SCRUM-125: Completed repair history & collection receipts)
- `GET /api/customer/jobs/:jobIdentifier/current-estimate`
- `POST /api/jobs/:jobIdentifier/estimate-decision`

See `docs/BACKEND_INTEGRATION.md` for the full authentication, estimate, and history integration details.
