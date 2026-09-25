"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock3,
  Cpu,
  History,
  Info,
  Printer,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getCurrentEstimate,
  getEstimateHistory,
  submitEstimateDecision,
} from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import type {
  CurrentEstimateResponse,
  EstimateHistoryResponse,
} from "@/src/shared/types/estimates";
import { InlineAlert } from "@/src/shared/ui/InlineAlert";
import { LoadingScreen } from "@/src/shared/ui/LoadingScreen";
import { useToast } from "@/src/shared/ui/ToastProvider";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";
import { CustomerEstimateCard } from "@/src/widgets/estimates/ui/CustomerEstimateCard";

export function CurrentEstimatePage() {
  return (
    <ProtectedRoute>
      <CurrentEstimateContent />
    </ProtectedRoute>
  );
}

function CurrentEstimateContent() {
  const params = useParams<{ jobIdentifier: string }>();
  const rawJobIdentifier = params?.jobIdentifier || "";
  const jobIdentifier = decodeURIComponent(rawJobIdentifier);

  const toast = useToast();
  const [data, setData] = useState<CurrentEstimateResponse | null>(null);
  const [history, setHistory] = useState<EstimateHistoryResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!jobIdentifier) return;
    setLoading(true);
    setError("");

    try {
      const [estRes, histRes] = await Promise.all([
        getCurrentEstimate(jobIdentifier),
        getEstimateHistory(jobIdentifier).catch(() => null),
      ]);
      setData(estRes);
      setHistory(histRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the current estimate.");
    } finally {
      setLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const decide = async (action: "APPROVE" | "REJECT") => {
    if (!data?.estimate || !data.estimate.canDecide || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await submitEstimateDecision(data.job.id, {
        action,
        estimateId: data.estimate.id,
        versionNumber: data.estimate.versionNumber,
        total: data.estimate.total,
      });
      toast.success(response.message || "Estimate decision recorded successfully.");
      await load();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Unable to save your estimate decision.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) return <LoadingScreen label="Loading repair estimate..." />;

  const isActionRequired = data?.estimate?.canDecide && !data?.estimate?.decision;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1140px] space-y-6 pb-12">
        {/* Top Service Helpline & Secure View Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Service Helpline
            </span>
            <a
              href="tel:+94112345678"
              className="text-xs font-black text-blue-600 hover:underline"
            >
              +94 11 234 5678
            </a>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Secure Estimate View
          </div>
        </div>

        {/* Back navigation & Page Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/repair-jobs/estimate"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Status Lookup
          </Link>

          <div className="flex items-center gap-2.5">
            {history?.versions && history.versions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <History className="h-4 w-4 text-slate-500" />
                {showHistory ? "Hide History" : "Estimate History"}
                {history.versions.length > 1 && (
                  <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                    {history.versions.length}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 text-slate-500" /> Print / PDF
            </button>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Main Title Banner */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Repair Job Estimate
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              Review and manage the latest estimate for job reference{" "}
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                {data?.job?.reference || jobIdentifier}
              </span>
            </p>
          </div>

          {isActionRequired && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              ACTION REQUIRED
            </div>
          )}
        </div>

        {error && <InlineAlert>{error}</InlineAlert>}

        {/* Estimate Revision History Drawer / Section (SCRUM-19) */}
        {showHistory && history && history.versions && history.versions.length > 0 && (
          <section className="space-y-5 rounded-[24px] border border-blue-200 bg-blue-50/30 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-7">
            <div className="flex items-center justify-between border-b border-blue-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Estimate Version History</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Chronological audit of all issued estimate versions and decisions
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                {history.versions.length} Version{history.versions.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-4">
              {history.versions.map((version) => (
                <div
                  key={version.id}
                  className={`rounded-2xl border p-5 transition ${
                    version.isCurrent
                      ? "border-blue-200 bg-white shadow-sm"
                      : "border-slate-200/80 bg-white/70"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-black text-slate-900">
                        Version {version.versionNumber}
                      </span>
                      {version.isCurrent ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700">
                          Current Version
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {version.status || "Superseded"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-semibold text-slate-400">
                        Issued {formatReceivedDate(version.issuedAt)}
                      </span>
                      <span className="font-black text-slate-900">
                        {version.currency} {version.total}
                      </span>
                    </div>
                  </div>

                  {version.changeReason && (
                    <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs">
                      <span className="font-bold text-slate-700">Reason for Revision: </span>
                      <span className="font-semibold text-slate-600">{version.changeReason}</span>
                    </div>
                  )}

                  {version.decision?.action && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                      <span
                        className={
                          version.decision.action === "APPROVED"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }
                      >
                        • Customer Decision: {version.decision.action}
                      </span>
                      {version.decision.decidedAt && (
                        <span className="font-normal text-slate-400">
                          on {formatReceivedDate(version.decision.decidedAt)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Line Items ({version.items.length})
                    </p>
                    <div className="space-y-1.5">
                      {version.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs font-medium text-slate-700"
                        >
                          <span>
                            <span className="font-bold text-slate-900">[{item.type}]</span>{" "}
                            {item.description} (×{item.quantity})
                          </span>
                          <span className="font-bold text-slate-900">
                            {version.currency} {item.lineTotal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data && (
          <>
            {/* Customer Hardware & Diagnostic Intake Card */}
            <section className="rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-7">
              {/* Card Top Row: Job badges + Metadata */}
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                    # {data.job.reference}
                  </span>
                  <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                    • Status: {data.job.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Device Type
                      </p>
                      <p>{data.job.deviceType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Received Date
                      </p>
                      <p>{formatReceivedDate(data.job.receivedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Bottom Row: Hardware name + Technician Diagnostic Callout */}
              <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr] lg:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                    Customer Hardware
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {data.job.makeModel}
                  </h2>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-5">
                    <span className="font-black text-slate-900">Technician Intake Diagnostic: </span>
                    <span className="font-semibold text-slate-700">
                      Damaged LCD display with touch failure detected along with secondary charging/power management IC fault preventing regular boot.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Estimate Section */}
            {!data.hasEstimate || !data.estimate ? (
              <section className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Clock3 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Estimate not issued yet</h2>
                <p className="mx-auto mt-2 max-w-xl text-xs font-semibold leading-5 text-slate-500">
                  {data.message || "We're still preparing your repair estimate. Check back shortly."}
                </p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4" /> Check again
                </button>
              </section>
            ) : (
              <CustomerEstimateCard
                estimate={data.estimate}
                isSubmitting={submitting}
                onApprove={() => void decide("APPROVE")}
                onReject={() => void decide("REJECT")}
              />
            )}
          </>
        )}

        {/* 4 Trust Feature Badges Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TrustBadge
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
            title="90-DAY WARRANTY"
            description="Comprehensive cover on replaced screens and ICs."
          />
          <TrustBadge
            icon={<Cpu className="h-5 w-5 text-blue-600" />}
            title="OEM GRADE QUALITY"
            description="High-fidelity parts tested for endurance & touch response."
          />
          <TrustBadge
            icon={<Receipt className="h-5 w-5 text-purple-600" />}
            title="NO HIDDEN FEES"
            description="Quoted price includes parts, workshop labor, & inspection."
          />
          <TrustBadge
            icon={<Zap className="h-5 w-5 text-amber-600" />}
            title="EXPRESS TURNAROUND"
            description="Estimated completion within 24-48 hours upon approval."
          />
        </div>

        {/* Footer info note */}
        <div className="border-t border-slate-200/80 pt-6 text-center text-xs font-semibold text-slate-400">
          <p>© 2026 RepairFlow Technologies. All rights reserved. Customer Support: support@repairflow.lk</p>
          <p className="mt-1 text-[11px] text-slate-400/80">
            Reference: {data?.job?.reference || jobIdentifier} • Token Verified Session
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}

function TrustBadge({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.11em] text-slate-900">
          {title}
        </p>
        <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function formatReceivedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}