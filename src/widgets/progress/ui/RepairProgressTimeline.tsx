"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Loader2,
  PackageCheck,
  PackageClock,
  PencilLine,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { getRepairProgressUpdates } from "@/src/shared/api/progressUpdates.api";
import { ApiError } from "@/src/shared/api/http";
import type { CustomerProgressUpdatesResponse } from "@/src/shared/types/progressUpdates";

type RepairProgressTimelineProps = {
  jobIdentifier: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function errorMessage(err: unknown) {
  return err instanceof ApiError || err instanceof Error
    ? err.message
    : "Unable to load repair progress.";
}

// Customer view of the technician's public progress updates (newest first).
export function RepairProgressTimeline({ jobIdentifier }: RepairProgressTimelineProps) {
  const [data, setData] = useState<CustomerProgressUpdatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getRepairProgressUpdates(jobIdentifier));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [jobIdentifier]);

  // Initial load: state is only set once the request settles.
  useEffect(() => {
    if (!jobIdentifier) return;
    let cancelled = false;
    getRepairProgressUpdates(jobIdentifier)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobIdentifier]);

  const updates = data?.updates || [];

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-slate-900">
              Repair Progress
            </h2>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              Updates from the technician working on your device.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="px-6 py-5">
        {isLoading && !data && (
          <div className="flex items-center gap-3 py-6 text-[13px] font-bold text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading repair progress…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data?.job.partsHold.active && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-950">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <PackageClock className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-black">Repair is waiting for a required part</p>
                {data.job.partsHold.requiredPart && (
                  <p className="mt-1 text-xs font-bold text-amber-900">
                    Required part: {data.job.partsHold.requiredPart}
                  </p>
                )}
                <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">
                  {data.job.partsHold.reason ||
                    "Repair work is temporarily paused while the required part is arranged."}
                </p>
              </div>
            </div>
          </div>
        )}

        {data &&
          !data.job.partsHold.active &&
          data.job.status === "Waiting for Parts" &&
          data.job.partsHold.releasedAt && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950">
              <PackageCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-black">Required parts have arrived</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
                  The parts delay has been cleared. The technician will explicitly resume the repair before the status changes back to In Repair.
                </p>
              </div>
            </div>
          )}

        {data && updates.length === 0 && !error && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Wrench className="h-6 w-6" />
            </div>
            <p className="mt-3 text-[14px] font-extrabold text-slate-700">No progress updates yet</p>
            <p className="mt-1 max-w-sm text-[12px] font-medium leading-5 text-slate-400">
              Once repair work starts, the technician&apos;s updates will appear here.
            </p>
          </div>
        )}

        {updates.length > 0 && (
          <ol className="relative space-y-5 border-l-2 border-slate-100 pl-6">
            {updates.map((update, index) => (
              <li key={update.id} className="relative">
                <span
                  className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    index === 0 ? "bg-violet-500 ring-4 ring-violet-100" : "bg-slate-300"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    {formatDateTime(update.recordedAt)}
                  </span>
                  {index === 0 && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">
                      Latest
                    </span>
                  )}
                  {update.isCorrection && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                      <PencilLine className="h-3 w-3" /> Corrected
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                    Estimate v{update.estimateVersionNumber}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[13px] font-semibold leading-6 text-slate-800">
                  {update.message}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
