"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Activity,
  Layers,
} from "lucide-react";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";
import { getCustomerRepairTracking } from "@/src/shared/api/tracking.api";
import { ApiError } from "@/src/shared/api/http";
import type { CustomerRepairTrackingResponse } from "@/src/shared/types/tracking";
import { RepairStatusStepper } from "@/src/widgets/progress/ui/RepairStatusStepper";
import { RepairContextualCTA } from "@/src/widgets/progress/ui/RepairContextualCTA";
import { RepairPublicTimeline } from "@/src/widgets/progress/ui/RepairPublicTimeline";
import { RepairProgressTimeline } from "@/src/widgets/progress/ui/RepairProgressTimeline";

export function RepairProgressPage() {
  return (
    <ProtectedRoute>
      <RepairProgressContent />
    </ProtectedRoute>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getErrorMessage(err: unknown) {
  if (err instanceof ApiError || err instanceof Error) {
    return err.message;
  }
  return "Unable to fetch repair tracking information.";
}

function RepairProgressContent() {
  const params = useParams<{ jobIdentifier: string }>();
  const jobIdentifier = decodeURIComponent(params?.jobIdentifier || "");

  const [data, setData] = useState<CustomerRepairTrackingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "technicianNotes">("overview");

  const refreshTracking = useCallback(async () => {
    if (!jobIdentifier) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCustomerRepairTracking(jobIdentifier);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => {
    if (!jobIdentifier) return;
    let cancelled = false;
    getCustomerRepairTracking(jobIdentifier)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobIdentifier]);

  const job = data?.job;
  const currentStatus = data?.currentStatus || data?.status || job?.status || "Received";
  const partsDelayActive =
    Boolean(data?.partsDelay) ||
    currentStatus === "Waiting for Parts" ||
    Boolean(data?.publicDelayReason);
  const isReturn = currentStatus === "Ready for Return";
  const isRejected = currentStatus === "Estimate Rejected";

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[900px] min-w-0 space-y-6 pb-16">
        {/* Top Navigation Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/repair-jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Repair Jobs
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshTracking}
              disabled={isLoading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Status
            </button>
            <Link
              href={`/repair-jobs/${encodeURIComponent(jobIdentifier)}/estimate`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ReceiptText className="h-3.5 w-3.5 text-slate-500" /> View Estimate
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Verified Customer Workspace
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Track Repair Progress
            </h1>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-bold text-slate-800">
              {jobIdentifier}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            Live updates, status stepper, and public milestones for your device repair.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Failed to load repair details</p>
              <p className="mt-0.5">{error}</p>
              <button
                type="button"
                onClick={refreshTracking}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white py-14 text-sm font-bold text-slate-400 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              Loading repair tracker data…
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {data && (
          <div className="space-y-6 min-w-0">
            {/* Device Info Summary Card */}
            <div className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.03)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                        {job?.deviceType || "Device"}
                      </span>
                      {job?.serialNumber && (
                        <span className="text-[11px] font-mono font-semibold text-slate-400">
                          S/N: {job.serialNumber}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
                      {job?.makeModel || "Device Under Repair"}
                    </h2>
                    {job?.reportedFault && (
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        <strong className="text-slate-700">Reported Issue:</strong> {job.reportedFault}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs sm:flex-col sm:border-t-0 sm:pt-0 sm:text-right">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Intake Date
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatDate(job?.receivedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Last Updated
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatDate(job?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual CTA Banner */}
            <RepairContextualCTA
              jobReference={jobIdentifier}
              status={currentStatus}
              actionRequired={data.actionRequired}
              actionType={data.actionType}
              actionMessage={data.actionMessage}
              estimateDecision={data.estimateDecision}
              partsDelay={data.partsDelay}
              publicDelayReason={data.publicDelayReason}
              handoverInstruction={data.handoverInstruction}
              collection={data.collection}
            />

            {/* Mobile-First Responsive Stepper */}
            <RepairStatusStepper
              currentStatus={currentStatus}
              partsDelayActive={partsDelayActive}
              isReturn={isReturn}
              isRejected={isRejected}
              receivedAt={job?.receivedAt}
              updatedAt={job?.updatedAt}
            />

            {/* Tabs for Timeline vs Technician Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
                    activeTab === "overview"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Public Activity Milestones ({data.publicEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("technicianNotes")}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
                    activeTab === "technicianNotes"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Technician Work Updates
                </button>
              </div>

              {activeTab === "overview" ? (
                <RepairPublicTimeline events={data.publicEvents} />
              ) : (
                <RepairProgressTimeline jobIdentifier={jobIdentifier} />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
