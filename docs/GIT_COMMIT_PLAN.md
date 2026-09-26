# Suggested step-by-step frontend commits

Run these only after copying the project into your existing frontend repository.

```bash
git checkout nigeeth_dev
git pull origin nigeeth_dev
```

Commit base setup:

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs .gitignore .env.example proxy.ts app/layout.tsx app/globals.css app/icon.svg app/page.tsx
git commit -m "setup RepairFlow frontend structure and API proxy"
```

Commit shared auth/API layer:

```bash
git add src/shared
git commit -m "add secure customer auth client and shared UI components"
```

Commit registration:

```bash
git add app/register src/views/auth/ui/RegisterPage.tsx src/widgets/auth/ui/RegisterForm.tsx
git commit -m "SCRUM-31 implement customer registration interface"
```

Commit login and OTP:

```bash
git add app/login src/views/auth/ui/LoginPage.tsx src/views/auth/ui/OtpPage.tsx src/widgets/auth/ui/LoginForm.tsx src/widgets/auth/ui/OtpVerificationForm.tsx
git commit -m "SCRUM-35 implement customer login and OTP verification UI"
```

Commit forgot password:

```bash
git add app/forgot-password src/views/auth/ui/ForgotPasswordPage.tsx src/views/auth/ui/ResetPasswordPage.tsx src/widgets/auth/ui/ForgotPasswordForm.tsx src/widgets/auth/ui/ResetPasswordForm.tsx
git commit -m "implement forgot password OTP and reset password UI"
```

Commit protected dashboard/logout:

```bash
git add app/dashboard src/views/dashboard src/widgets/dashboard
git commit -m "SCRUM-37 add protected customer session and logout UI"
```

Commit documentation:

```bash
git add README.md docs
git commit -m "document RepairFlow frontend setup and backend integration"
```

Then:

```bash
git status
git push origin nigeeth_dev
```
