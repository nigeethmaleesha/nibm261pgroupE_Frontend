"use client";

import { ArrowLeft, CircleDollarSign, Clock3, RefreshCw, Wrench } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getCurrentEstimate, submitEstimateDecision } from "@/src/shared/api/estimates.api";
import { ApiError } from "@/src/shared/api/http";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import type { CurrentEstimateResponse } from "@/src/shared/types/estimates";
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
  const jobIdentifier = decodeURIComponent(params.jobIdentifier || "");
  const toast = useToast();
  const [data, setData] = useState<CurrentEstimateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!jobIdentifier) return;
    setLoading(true);
    setError("");

    try {
      setData(await getCurrentEstimate(jobIdentifier));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the current estimate.");
    } finally {
      setLoading(false);
    }
  }, [jobIdentifier]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (action: "APPROVE" | "REJECT") => {
    if (!data?.estimate || !data.estimate.canDecide || submitting) return;

    const verb = action === "APPROVE" ? "approve" : "reject";
    const confirmed = window.confirm(`Are you sure you want to ${verb} estimate version ${data.estimate.versionNumber}?`);
    if (!confirmed) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await submitEstimateDecision(data.job.id, {
        action,
        versionNumber: data.estimate.versionNumber,
        total: data.estimate.total,
      });
      toast.success(response.message);
      await load();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to save your estimate decision.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) return <LoadingScreen label="Loading current estimate..." />;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1080px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/repair-jobs/estimate" className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500 transition hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" /> Find another job
            </Link>
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)]">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">SCRUM-15 · Current estimate</p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  {data?.job.reference || "Repair estimate"}
                </h1>
                {data && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {data.job.deviceType} · {data.job.makeModel}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {error && <InlineAlert>{error}</InlineAlert>}

        {data && (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <ContextCard label="Job status" value={data.job.status} icon={<Wrench className="h-4 w-4" />} />
              <ContextCard label="Received" value={formatDate(data.job.receivedAt)} icon={<Clock3 className="h-4 w-4" />} />
              <ContextCard label="Serial number" value={data.job.serialNumber || "Not recorded"} icon={<CircleDollarSign className="h-4 w-4" />} />
            </section>

            {!data.hasEstimate || !data.estimate ? (
              <section className="rounded-[28px] border border-blue-200 bg-white p-7 text-center shadow-[0_16px_45px_rgba(15,23,42,0.05)] sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Clock3 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-black text-slate-900">Estimate not issued yet</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                  {data.message || "Your repair estimate is still being prepared. Please check again later."}
                </p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-[12px] font-black text-white transition hover:bg-blue-700"
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
      </div>
    </DashboardShell>
  );
}

function ContextCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.035)]">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.11em]">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-[12px] font-black text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
