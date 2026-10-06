"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/src/shared/auth/AuthProvider";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";
import { getMyJobs } from "@/src/shared/api/repairJobs.api";
import { getCompletedJobsHistory } from "@/src/shared/api/jobHistory.api";
import type { CustomerRepairJobListItem } from "@/src/shared/types/repairJobs";
import { PastRepairsTab } from "@/src/widgets/history/ui/PastRepairsTab";

export function CustomerDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const INACTIVE = ["Ready for Collection", "Ready for Return", "Collected"];
const AWAITING = ["Awaiting Approval"];

type DashboardTab = "overview" | "past-repairs";

function DashboardContent() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(/\s+/)[0] || "Customer";

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [jobs, setJobs] = useState<CustomerRepairJobListItem[]>([]);
  const [pastRepairsCount, setPastRepairsCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with URL parameter ?tab=past-repairs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "past-repairs") {
        setActiveTab("past-repairs");
      }
    }
  }, []);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    let active = true;

    // Load active jobs
    getMyJobs()
      .then((res) => {
        if (active) setJobs(res.jobs);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });

    // Load completed jobs count
    getCompletedJobsHistory()
      .then((res) => {
        if (active) setPastRepairsCount(res.count);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const activeCount    = jobs.filter((j) => !INACTIVE.includes(j.status)).length;
  const awaitingCount  = jobs.filter((j) => AWAITING.includes(j.status)).length;
  const completedCount = pastRepairsCount !== null ? pastRepairsCount : jobs.filter((j) => j.status === "Collected").length;
  const readyForReturnJobs = jobs.filter((j) => j.status === "Ready for Return");

  const statValue = (n: number) => (isLoading ? "—" : String(n));

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1160px]">

        {/* ── Welcome banner ── */}
        <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#0f3f96] via-[#145bc2] to-[#1ca5d8] p-6 text-white shadow-[0_22px_60px_rgba(30,64,175,0.2)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[54px] border-white/8" />
          <div className="pointer-events-none absolute bottom-[-90px] left-[28%] h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-blue-50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure customer session
              </div>
              <h1 className="text-[30px] font-black tracking-[-0.045em] sm:text-[38px]">
                Welcome, {firstName}
              </h1>
              <p className="mt-2 max-w-[520px] text-sm font-medium leading-6 text-blue-100 sm:text-[15px]">
                Track ongoing workshop diagnostics, approve repair estimates, and browse your verified past repair collection receipts.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-sm sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">Account</p>
              <p className="mt-1 max-w-[260px] truncate text-sm font-extrabold text-white">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* SCRUM-125: Dashboard Tabs (Overview vs Past Repairs) */}
        <div className="mt-7 flex items-center gap-2 border-b border-slate-200/80">
          <button
            type="button"
            id="tab-overview"
            onClick={() => handleTabChange("overview")}
            className={`relative flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "overview"
                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                {activeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-past-repairs"
            onClick={() => handleTabChange("past-repairs")}
            className={`relative flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "past-repairs"
                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Past Repairs</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === "past-repairs"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {/* ── Tab Content: Active Overview ── */}
        {activeTab === "overview" && (
          <div className="mt-6 space-y-7">
            {/* SCRUM-117: Ready for Return Customer Notification Banner */}
            {!isLoading && readyForReturnJobs.length > 0 && (
              <div className="flex items-start gap-4 rounded-[24px] border-2 border-amber-300 bg-amber-50/95 p-5 shadow-[0_8px_24px_rgba(245,158,11,0.12)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                      Ready for Pickup (Unrepaired)
                    </span>
                    <span className="text-[12px] font-bold text-amber-900">
                      {readyForReturnJobs.length} device{readyForReturnJobs.length > 1 ? "s" : ""} prepared for pickup
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-900 sm:text-sm">
                    Your device ({readyForReturnJobs.map((j) => `${j.reference} - ${j.makeModel}`).join(", ")}) is ready for pickup without repair at our service centre. Please bring your reference code and a valid photo ID.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/repair-jobs"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-sm hover:bg-amber-700"
                    >
                      View Pickup Details →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── Stat cards ── */}
            <div className="grid gap-5 md:grid-cols-3">
              <StatCard
                icon={<Wrench className="h-5 w-5" />}
                title="Active repairs"
                value={statValue(activeCount)}
                note={isLoading ? "Loading…" : activeCount > 0 ? "devices currently in shop" : "No active repairs"}
                href="/repair-jobs"
                loading={isLoading}
              />
              <StatCard
                icon={<FileText className="h-5 w-5" />}
                title="Awaiting approval"
                value={statValue(awaitingCount)}
                note={isLoading ? "Loading…" : awaitingCount > 0 ? "estimate(s) need your decision" : "No pending estimates"}
                href="/repair-jobs"
                loading={isLoading}
                urgent={awaitingCount > 0}
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Completed repairs"
                value={statValue(completedCount)}
                note={isLoading ? "Loading…" : completedCount > 0 ? "view past repairs & receipts" : "No completed repairs yet"}
                onClick={() => handleTabChange("past-repairs")}
                loading={isLoading}
              />
            </div>

            {/* ── Quick access ── */}
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* My Repair Jobs quick link */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">
                      My repair jobs
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900">
                      Repair activity
                    </h2>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>

                {isLoading ? (
                  <div className="mt-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                    <p className="text-sm font-semibold text-slate-400">Loading jobs…</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="mt-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                        <CalendarClock className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-base font-extrabold text-slate-800">No repair jobs yet</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        Visit a RepairFlow service centre to register a device.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    {jobs.slice(0, 3).map((job) => (
                      <Link
                        key={job.id}
                        href={`/repair-jobs/${encodeURIComponent(job.reference)}/estimate`}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/60"
                      >
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">{job.reference}</p>
                          <p className="mt-0.5 text-[12px] font-bold text-slate-700">{job.makeModel}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          job.status === "Awaiting Approval"   ? "bg-amber-50 text-amber-700"
                          : job.status === "Ready for Collection" ? "bg-emerald-50 text-emerald-700"
                          : job.status === "Ready for Return"     ? "bg-amber-100 text-amber-900 border border-amber-300 font-black"
                          : job.status === "Collected"            ? "bg-slate-100 text-slate-500"
                          : "bg-blue-50 text-blue-700"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {job.status === "Ready for Return" ? "Ready for Pickup (Unrepaired)" : job.status}
                        </span>
                      </Link>
                    ))}
                    {jobs.length > 3 && (
                      <Link
                        href="/repair-jobs"
                        className="block pt-1 text-center text-[12px] font-extrabold text-blue-600 hover:underline"
                      >
                        View all {jobs.length} jobs →
                      </Link>
                    )}
                  </div>
                )}
              </section>

              {/* Session status */}
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
                  Access tokens refresh automatically when possible. A revoked or expired refresh session sends you back to sign in.
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── Tab Content: Past Repairs (SCRUM-125) ── */}
        {activeTab === "past-repairs" && (
          <div className="mt-7">
            <PastRepairsTab />
          </div>
        )}

      </div>
    </DashboardShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  title,
  value,
  note,
  href,
  onClick,
  loading,
  urgent = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
  href?: string;
  onClick?: () => void;
  loading: boolean;
  urgent?: boolean;
}) {
  const cardClassName = `group text-left w-full rounded-[22px] border bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.045)] transition hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${
    urgent ? "border-rose-200" : "border-slate-200/80"
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${urgent ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
          {icon}
        </div>
        {urgent && (
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white">
            Action needed
          </span>
        )}
      </div>
      <div className={`mt-5 text-[32px] font-black tracking-[-0.04em] ${loading ? "animate-pulse text-slate-300" : urgent ? "text-rose-600" : "text-slate-900"}`}>
        {value}
      </div>
      <div className="mt-1 text-sm font-extrabold text-slate-700">{title}</div>
      <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-400">{note}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cardClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || "#"}
      className={cardClassName}
    >
      {content}
    </Link>
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
