"use client";

import { CalendarClock, CheckCircle2, ClipboardList, Clock3, FileText, ShieldCheck, Wrench } from "lucide-react";
import { useAuth } from "@/src/shared/auth/AuthProvider";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";

export function CustomerDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(/\s+/)[0] || "Customer";

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1160px]">
        <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#0f3f96] via-[#145bc2] to-[#1ca5d8] p-6 text-white shadow-[0_22px_60px_rgba(30,64,175,0.2)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[54px] border-white/8" />
          <div className="pointer-events-none absolute bottom-[-90px] left-[28%] h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-blue-50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure customer session
              </div>
              <h1 className="text-[30px] font-black tracking-[-0.045em] sm:text-[38px]">Welcome, {firstName}</h1>
              <p className="mt-2 max-w-[620px] text-sm font-medium leading-6 text-blue-100 sm:text-[15px]">
                Your authentication flow is connected and ready. Repair-job and estimate modules can plug into this dashboard as your teammates complete those APIs.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-sm sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">Account</p>
              <p className="mt-1 max-w-[260px] truncate text-sm font-extrabold text-white">{user?.email}</p>
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <StatusCard icon={<Wrench className="h-5 w-5" />} title="Active repairs" value="—" note="Connect repair-job API when available" />
          <StatusCard icon={<FileText className="h-5 w-5" />} title="Current estimate" value="—" note="Estimate module dependency pending" />
          <StatusCard icon={<CheckCircle2 className="h-5 w-5" />} title="Completed repairs" value="—" note="Ready for future integration" />
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">Integration workspace</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900">Repair activity</h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <div className="max-w-[470px]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-800">No repair-job API connected yet</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  This is intentional: the frontend does not invent repair or estimate records before the team-owned backend modules are finalized.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">Account security</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900">Session status</h2>

            <div className="mt-6 space-y-3">
              <SecurityRow label="Email verified" value={user?.isEmailVerified ? "Verified" : "Pending"} good={Boolean(user?.isEmailVerified)} />
              <SecurityRow label="Account status" value={user?.isActive ? "Active" : "Disabled"} good={Boolean(user?.isActive)} />
              <SecurityRow label="Role" value="Customer" good />
              <SecurityRow label="Token storage" value="HttpOnly cookies" good />
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-[12px] font-semibold leading-5 text-slate-600">
              Access tokens refresh automatically when possible. A revoked or expired refresh session sends the customer back to sign in.
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatusCard({ icon, title, value, note }: { icon: React.ReactNode; title: string; value: string; note: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.045)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
        <Clock3 className="h-4 w-4 text-slate-300" />
      </div>
      <div className="mt-5 text-[28px] font-black tracking-[-0.04em] text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-700">{title}</div>
      <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-400">{note}</p>
    </div>
  );
}

function SecurityRow({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-[12px] font-bold text-slate-500">{label}</span>
      <span className={`inline-flex items-center gap-1.5 text-[12px] font-extrabold ${good ? "text-emerald-600" : "text-amber-600"}`}>
        <span className={`h-2 w-2 rounded-full ${good ? "bg-emerald-500" : "bg-amber-500"}`} />
        {value}
      </span>
    </div>
  );
}
