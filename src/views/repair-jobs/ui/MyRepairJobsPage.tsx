"use client";

// SCRUM-103: Customer Portal – My Repair Jobs list page.
// SCRUM-105: empty state when the customer has no repair jobs.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Loader2,
  Monitor,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";
import { useAuth } from "@/src/shared/auth/AuthProvider";
import { getMyJobs } from "@/src/shared/api/repairJobs.api";
import type {
  CustomerRepairJobListItem,
  RepairJobStatus,
} from "@/src/shared/types/repairJobs";

// ─── Page shell ───────────────────────────────────────────────────────────────

export function MyRepairJobsPage() {
  return (
    <ProtectedRoute>
      <MyRepairJobsContent />
    </ProtectedRoute>
  );
}

// ─── Status badge config ──────────────────────────────────────────────────────

type BadgeCfg = { bg: string; dot: string; text: string };

const STATUS_CFG: Record<RepairJobStatus, BadgeCfg> = {
  Received:              { bg: "bg-slate-100",   dot: "bg-slate-400",   text: "text-slate-600"   },
  Diagnosing:            { bg: "bg-amber-50",    dot: "bg-amber-400",   text: "text-amber-700"   },
  "Awaiting Approval":   { bg: "bg-amber-50",    dot: "bg-amber-400",   text: "text-amber-700"   },
  Approved:              { bg: "bg-emerald-50",  dot: "bg-emerald-500", text: "text-emerald-700"  },
  "Estimate Rejected":   { bg: "bg-rose-50",     dot: "bg-rose-500",    text: "text-rose-700"    },
  "In Repair":           { bg: "bg-violet-50",   dot: "bg-violet-500",  text: "text-violet-700"  },
  "Waiting for Parts":   { bg: "bg-blue-50",     dot: "bg-blue-500",    text: "text-blue-700"    },
  "Ready for Collection":{ bg: "bg-emerald-50",  dot: "bg-emerald-500", text: "text-emerald-700"  },
  "Ready for Return":    { bg: "bg-teal-50",     dot: "bg-teal-500",    text: "text-teal-700"    },
  Collected:             { bg: "bg-slate-100",   dot: "bg-slate-400",   text: "text-slate-500"   },
};

function StatusBadge({ status }: { status: RepairJobStatus }) {
  const cfg = STATUS_CFG[status] ?? { bg: "bg-slate-100", dot: "bg-slate-400", text: "text-slate-600" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const REQUIRES_ACTION: RepairJobStatus[] = ["Awaiting Approval"];
const IN_PROGRESS: RepairJobStatus[] = [
  "Received", "Diagnosing", "Approved", "In Repair", "Waiting for Parts",
];
const INACTIVE: RepairJobStatus[] = [
  "Ready for Collection", "Ready for Return", "Collected",
];

type FilterKey = "all" | "action" | "progress";

// ─── Empty state (SCRUM-105) ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <PackageSearch className="h-7 w-7 text-slate-400" />
            </div>
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-400" />
          </div>
          <p className="text-[15px] font-extrabold text-slate-700">No repair jobs yet</p>
          <p className="mt-1.5 max-w-[320px] text-[12px] font-medium leading-5 text-slate-400">
            When a RepairFlow technician registers a device for your account, it will appear here with its status and estimate details.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-[11px] font-semibold text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            Only jobs linked to your account are displayed.
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function JobRow({ job }: { job: CustomerRepairJobListItem }) {
  const requiresAction = REQUIRES_ACTION.includes(job.status);
  const isInactive = job.status === "Collected";

  return (
    <tr
      className={`border-t border-slate-100 transition-colors hover:bg-slate-50/70 ${
        isInactive ? "opacity-60" : ""
      }`}
    >
      {/* Reference */}
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-2">
          {requiresAction && (
            <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-[10px] font-black text-white">
              !
            </span>
          )}
          <span
            className={`text-[13px] font-black ${
              isInactive ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {job.reference}
          </span>
        </div>
      </td>

      {/* Device */}
      <td className="py-4 pr-4">
        <p className={`text-[13px] font-bold ${isInactive ? "text-slate-400" : "text-slate-800"}`}>
          {job.makeModel}
        </p>
        {job.reportedFault && (
          <p className="mt-0.5 max-w-[220px] truncate text-[11px] font-medium text-slate-400">
            {job.reportedFault}
          </p>
        )}
      </td>

      {/* Intake date */}
      <td className="py-4 pr-4">
        <span className="text-[12px] font-semibold text-slate-500">
          {formatDate(job.receivedAt)}
        </span>
      </td>

      {/* Status */}
      <td className="py-4 pr-4">
        <StatusBadge status={job.status} />
      </td>

      {/* Action */}
      <td className="py-4 pr-6 text-right">
        {requiresAction ? (
          <Link
            id={`review-estimate-${job.reference}`}
            href={`/repair-jobs/${encodeURIComponent(job.reference)}/estimate`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-[12px] font-extrabold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition hover:bg-blue-700"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Review Estimate
          </Link>
        ) : (
          <Link
            id={`view-details-${job.reference}`}
            href={`/repair-jobs/${encodeURIComponent(job.reference)}/estimate`}
            className={`inline-flex items-center gap-1 text-[12px] font-bold transition ${
              isInactive
                ? "text-slate-400 hover:text-slate-500"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </td>
    </tr>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function MyRepairJobsContent() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(/\s+/)[0] || "Customer";

  const [jobs, setJobs] = useState<CustomerRepairJobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.jobs);
      setError(null);
      setLastSync(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load repair jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    // Auto-sync every 30 s (shown in the footer as "Auto-sync active (30s)")
    syncIntervalRef.current = setInterval(fetchJobs, 30_000);
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [fetchJobs]);

  // Derived counts
  const activeCount   = jobs.filter((j) => !INACTIVE.includes(j.status)).length;
  const actionCount   = jobs.filter((j) => REQUIRES_ACTION.includes(j.status)).length;
  const collectedCount = jobs.filter((j) => j.status === "Collected").length;
  const progressCount = jobs.filter((j) => IN_PROGRESS.includes(j.status)).length;

  // Filtered rows
  const filtered =
    filter === "action"   ? jobs.filter((j) => REQUIRES_ACTION.includes(j.status))
    : filter === "progress" ? jobs.filter((j) => IN_PROGRESS.includes(j.status))
    : jobs;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1060px] space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                Verified Customer Workspace
              </span>
            </div>
            <h1 className="text-[28px] font-black tracking-[-0.04em] text-slate-900">
              My Repair Jobs
            </h1>
            <p className="mt-1 text-[13px] font-medium text-slate-500">
              Welcome back,{" "}
              <span className="font-extrabold text-slate-700">{firstName}</span>.{" "}
              {activeCount > 0
                ? "You have active service orders under real-time workshop tracking."
                : "No active service orders at the moment."}
            </p>
          </div>

          {/* Service center status */}
          <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Service Center Status
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-extrabold text-slate-700">
                Workshop 04 · Active Ops
              </span>
            </div>
          </div>
        </div>

        {/* ── Summary cards ── */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:grid-cols-3">

            {/* Active Repairs */}
            <div className="relative flex items-start justify-between px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Active Repairs
                </p>
                <p className="mt-2 text-[36px] font-black leading-none tracking-[-0.05em] text-slate-900">
                  {activeCount}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                  devices in shop
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                  <RefreshCw className="h-3 w-3" /> Real-time bench testing
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Monitor className="h-5 w-5" />
              </div>
              <div className="absolute inset-y-4 right-0 hidden w-px bg-slate-100 sm:block" />
            </div>

            {/* Awaiting Approval */}
            <div className="relative flex items-start justify-between border-t border-slate-100 px-6 py-5 sm:border-t-0">
              {/* red left accent line */}
              <div className="absolute inset-y-0 left-0 hidden w-[3px] bg-rose-400 sm:block" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Awaiting My Approval
                  </p>
                  {actionCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white">
                      Action Req.
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[36px] font-black leading-none tracking-[-0.05em] text-slate-900">
                  {actionCount}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                  estimate{actionCount !== 1 ? "s" : ""} ready
                </p>
                {actionCount > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-600">
                    <AlertCircle className="h-3 w-3" /> Response pauses repair cycle
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-400">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="absolute inset-y-4 right-0 hidden w-px bg-slate-100 sm:block" />
            </div>

            {/* Collected Jobs */}
            <div className="flex items-start justify-between border-t border-slate-100 px-6 py-5 sm:border-t-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Collected Jobs
                </p>
                <p className="mt-2 text-[36px] font-black leading-none tracking-[-0.05em] text-slate-900">
                  {collectedCount}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                  archived device{collectedCount !== 1 ? "s" : ""}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> 90-day parts warranty valid
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* ── Jobs table ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">

          {/* Table header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.03em] text-slate-900">
                Repair Jobs
              </h2>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                Track inspection reports, approve parts lists, and verify delivery readiness.
              </p>
            </div>

            {/* Filter tabs — only show when there are jobs */}
            {!isLoading && !error && jobs.length > 0 && (
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(
                  [
                    { key: "all"      as FilterKey, label: `All Jobs (${jobs.length})` },
                    { key: "action"   as FilterKey, label: "Requires Action", dot: actionCount > 0 },
                    { key: "progress" as FilterKey, label: `In Progress (${progressCount})` },
                  ]
                ).map(({ key, label, dot }) => (
                  <button
                    key={key}
                    id={`filter-${key}`}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition ${
                      filter === key
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                    {dot && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-3 px-6 py-14 text-[13px] font-bold text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your repair jobs…
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-[13px] font-extrabold text-rose-600">Could not load repair jobs</p>
              <p className="text-[11px] text-slate-400">{error}</p>
              <button
                id="retry-load-jobs"
                onClick={fetchJobs}
                className="mt-1 rounded-xl bg-rose-600 px-4 py-2 text-[11px] font-extrabold text-white transition hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                {jobs.length > 0 && (
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="py-3 pl-6 pr-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Job Reference
                      </th>
                      <th className="py-3 pr-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Device
                      </th>
                      <th className="py-3 pr-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Intake Date
                      </th>
                      <th className="py-3 pr-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>
                      <th className="py-3 pr-6 text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {filtered.length === 0 && jobs.length === 0 ? (
                    <EmptyState />
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[12px] font-semibold text-slate-400">
                        No jobs match this filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((job) => <JobRow key={job.id} job={job} />)
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer bar */}
          {!isLoading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
              <p className="text-[11px] font-medium text-slate-400">
                {jobs.length > 0
                  ? `Showing ${filtered.length} of ${jobs.length} service ticket${jobs.length !== 1 ? "s" : ""} issued for ${user?.fullName}`
                  : "No service tickets issued yet"}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Auto-sync active (30s)
                {lastSync && (
                  <span className="ml-1 text-[10px] font-medium text-slate-400">
                    · Updated{" "}
                    {lastSync.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
