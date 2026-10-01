"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ReceiptText, ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";
import { RepairProgressTimeline } from "@/src/widgets/progress/ui/RepairProgressTimeline";

export function RepairProgressPage() {
  return (
    <ProtectedRoute>
      <RepairProgressContent />
    </ProtectedRoute>
  );
}

function RepairProgressContent() {
  const params = useParams<{ jobIdentifier: string }>();
  const jobIdentifier = decodeURIComponent(params?.jobIdentifier || "");

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[900px] space-y-6 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/repair-jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Repair Jobs
          </Link>
          <Link
            href={`/repair-jobs/${encodeURIComponent(jobIdentifier)}/estimate`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ReceiptText className="h-4 w-4 text-slate-500" /> View Estimate
          </Link>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Verified Customer Workspace
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Track Repair Progress
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Job reference{" "}
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
              {jobIdentifier}
            </span>
          </p>
        </div>

        <RepairProgressTimeline jobIdentifier={jobIdentifier} />
      </div>
    </DashboardShell>
  );
}
