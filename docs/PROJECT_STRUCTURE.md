# Project Structure

```text
app/                         Next.js routes
  login/
  register/
  forgot-password/
  dashboard/

src/
  views/                     Route-level composed screens
    auth/ui/
    dashboard/ui/

  widgets/                   Feature UI and business interactions
    auth/ui/
    dashboard/ui/

  shared/
    api/                     HTTP client + RepairFlow auth endpoints
    auth/                    Session provider, route guard, pending OTP state
    lib/                     Validation helpers
    types/                   Shared TypeScript API types
    ui/                      Reusable design-system components

proxy.ts                     Same-origin API proxy to Express backend
.env                         Local config (ignored by Git)
.env.example                 Safe config template
```

This follows the same route/view/widget/shared separation used in the supplied frontend reference while keeping the code small enough for coursework teammates to extend safely.
