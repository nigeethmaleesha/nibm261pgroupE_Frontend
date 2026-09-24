"use client";

import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Clock3,
  FileClock,
  History,
  PackageSearch,
  XCircle,
} from "lucide-react";
import type {
  CustomerEstimate,
  CustomerEstimateDecisionState,
} from "@/src/shared/types/estimates";

export function CustomerEstimateCard({
  estimate,
  isSubmitting,
  onApprove,
  onReject,
}: {
  estimate: CustomerEstimate;
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.065)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Issued repair estimate</p>
            <h2 className="mt-0.5 text-xl font-black tracking-[-0.025em] text-slate-950">Version {estimate.versionNumber}</h2>
          </div>
        </div>
        <DecisionBadge state={estimate.decisionState} />
      </div>

      <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:grid-cols-3 sm:px-7">
        <SummaryItem label="Version" value={`v${estimate.versionNumber}`} icon={<History className="h-4 w-4" />} />
        <SummaryItem label="Issued" value={formatDateTime(estimate.issuedAt)} icon={<FileClock className="h-4 w-4" />} />
        <SummaryItem label="Estimate total" value={`LKR ${estimate.total}`} icon={<BadgeCheck className="h-4 w-4" />} emphasis />
      </div>

      {estimate.proposedWork.length > 0 && (
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Proposed work</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {estimate.proposedWork.map((work, index) => (
              <div key={`${work}-${index}`} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-[12px] font-semibold leading-5 text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {work}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Itemised amounts</p>
            <h3 className="mt-1 text-base font-black text-slate-900">Estimate breakdown</h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">{estimate.items.length} line{estimate.items.length === 1 ? "" : "s"}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="hidden grid-cols-[72px_1fr_64px_120px_120px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 md:grid">
            <span>Type</span>
            <span>Description</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span className="text-right">Amount</span>
          </div>

          {estimate.items.map((item) => (
            <div key={item.id} className="border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid md:grid-cols-[72px_1fr_64px_120px_120px] md:items-center md:gap-3">
              <div className="mb-2 flex items-center justify-between gap-3 md:mb-0 md:block">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${item.type === "PART" ? "bg-violet-50 text-violet-700" : "bg-cyan-50 text-cyan-700"}`}>
                  {item.type === "PART" ? "Part" : "Labour"}
                </span>
                <span className="text-[11px] font-bold text-slate-400 md:hidden">Line {item.lineNumber}</span>
              </div>
              <p className="text-[12px] font-bold leading-5 text-slate-700">{item.description}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 md:mt-0 md:contents">
                <MobileAmount label="Qty" value={String(item.quantity)} />
                <MobileAmount label="Unit" value={`LKR ${item.unitPrice}`} />
                <MobileAmount label="Amount" value={`LKR ${item.lineTotal}`} strong />
                <span className="hidden text-[12px] font-bold text-slate-600 md:block">{item.quantity}</span>
                <span className="hidden text-[12px] font-bold text-slate-600 md:block">LKR {item.unitPrice}</span>
                <span className="hidden text-right text-[12px] font-black text-slate-950 md:block">LKR {item.lineTotal}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Decision state</p>
            <p className="mt-1 text-[12px] font-extrabold">{decisionLabel(estimate.decisionState)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Total</p>
            <p className="mt-1 text-xl font-black sm:text-2xl">LKR {estimate.total}</p>
          </div>
        </div>

        {estimate.canDecide && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-amber-950">Your decision is required</h3>
                <p className="mt-1 text-[12px] font-semibold leading-5 text-amber-800">
                  Review the latest estimate carefully. Approval or rejection is only available while this latest version is awaiting your decision.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onApprove}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-[12px] font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? "Saving decision..." : "Approve estimate"}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onReject}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 text-[12px] font-black text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" /> Reject estimate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {estimate.isSuperseded && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <Ban className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-500" />
            <p className="text-[12px] font-semibold leading-5 text-slate-600">
              This version has been superseded by a newer estimate. Decision controls are intentionally unavailable.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryItem({
  label,
  value,
  icon,
  emphasis = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.11em]">{label}</span>
      </div>
      <p className={`mt-2 font-black ${emphasis ? "text-base text-blue-700" : "text-[13px] text-slate-800"}`}>{value}</p>
    </div>
  );
}

function MobileAmount({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 md:hidden">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[10px] ${strong ? "font-black text-slate-900" : "font-bold text-slate-600"}`}>{value}</p>
    </div>
  );
}

function DecisionBadge({ state }: { state: CustomerEstimateDecisionState }) {
  const classes: Record<CustomerEstimateDecisionState, string> = {
    SUPERSEDED: "border-slate-200 bg-slate-100 text-slate-600",
    AWAITING_APPROVAL: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
    ISSUED: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[11px] font-black ${classes[state]}`}>
      {decisionLabel(state)}
    </span>
  );
}

function decisionLabel(state: CustomerEstimateDecisionState) {
  const labels: Record<CustomerEstimateDecisionState, string> = {
    SUPERSEDED: "Superseded",
    AWAITING_APPROVAL: "Awaiting Approval",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    ISSUED: "Issued",
  };
  return labels[state];
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
