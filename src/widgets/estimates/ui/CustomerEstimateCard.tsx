"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  Info,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import type { CustomerEstimate } from "@/src/shared/types/estimates";

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
  const isAwaiting = estimate.canDecide && (!estimate.decision || estimate.decisionState === "AWAITING_APPROVAL");
  const isApproved = estimate.decision?.action === "APPROVED" || estimate.decisionState === "APPROVED";
  const isRejected = estimate.decision?.action === "REJECTED" || estimate.decisionState === "REJECTED";

  // Proposed scope of work items fallback if array is empty
  const scopeOfWork =
    estimate.proposedWork && estimate.proposedWork.length > 0
      ? estimate.proposedWork
      : estimate.items.map((item) => item.description);

  return (
    <div className="space-y-6">
      {/* Main Issued Estimate Card */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-8">
        {/* Estimate Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                Issued Repair Estimate
              </p>
              <h2 className="mt-0.5 text-lg font-black tracking-[-0.02em] text-slate-950">
                Estimate Version {estimate.versionNumber}
              </h2>
            </div>
          </div>

          <div className="flex items-center">
            {isAwaiting && (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                Awaiting Customer Approval
              </span>
            )}
            {isApproved && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Estimate Approved
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700">
                <XCircle className="h-4 w-4 text-rose-600" /> Estimate Rejected
              </span>
            )}
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Estimate Version
            </p>
            <p className="mt-2 text-base font-black text-slate-900">
              v{estimate.versionNumber}{" "}
              <span className="text-xs font-semibold text-slate-400">
                ({estimate.versionNumber === 1 ? "Initial Quote" : `Revision ${estimate.versionNumber}`})
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Timestamp Issued
            </p>
            <p className="mt-2 text-base font-black text-slate-900">
              {formatFullDateTime(estimate.issuedAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">
              Estimate Total
            </p>
            <p className="mt-2 text-xl font-black text-blue-600">
              {estimate.currency} {formatMoney(estimate.total)}
            </p>
          </div>
        </div>

        {/* Proposed Scope of Work */}
        {scopeOfWork.length > 0 && (
          <div className="mt-7">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              Proposed Scope of Work
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {scopeOfWork.map((work, index) => (
                <div
                  key={`${work}-${index}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {work}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itemised Amounts Breakdown Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              Itemised Amounts &amp; Breakdown
            </p>
            <span className="text-xs font-medium text-slate-400">
              {estimate.items.length} line item{estimate.items.length === 1 ? "" : "s"} included
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                  <th className="py-3 font-black">Type</th>
                  <th className="py-3 font-black">Description</th>
                  <th className="py-3 font-black">Warranty</th>
                  <th className="py-3 text-center font-black">Qty</th>
                  <th className="py-3 text-right font-black">Unit Price</th>
                  <th className="py-3 text-right font-black">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimate.items.map((item) => {
                  const { title, subtitle } = splitDescription(item.description);
                  const isPart = item.type === "PART";
                  return (
                    <tr key={item.id} className="text-xs">
                      <td className="py-4 pr-3 align-top">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase ${
                            isPart
                              ? "bg-purple-50 text-purple-700"
                              : "bg-cyan-50 text-cyan-700"
                          }`}
                        >
                          {isPart ? "Part" : "Labour"}
                        </span>
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <p className="font-bold text-slate-900">{title}</p>
                        {subtitle && (
                          <p className="mt-0.5 text-[11px] font-medium leading-4 text-slate-500">
                            {subtitle}
                          </p>
                        )}
                      </td>
                      <td className="py-4 pr-3 align-top font-semibold text-slate-600">
                        {isPart ? "90 Days" : "Included"}
                      </td>
                      <td className="py-4 align-top text-center font-bold text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-4 pl-3 align-top text-right font-bold text-slate-700">
                        {estimate.currency} {formatMoney(item.unitPrice)}
                      </td>
                      <td className="py-4 pl-3 align-top text-right font-black text-slate-950">
                        {estimate.currency} {formatMoney(item.lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navy Dark Footer Total Bar inside Card */}
        <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-[#0B1527] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Current Status
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isApproved
                    ? "bg-emerald-400"
                    : isRejected
                      ? "bg-rose-400"
                      : "bg-amber-400"
                }`}
              />
              <p className="text-sm font-black text-white">
                {isApproved
                  ? "Approved by Customer"
                  : isRejected
                    ? "Rejected by Customer"
                    : "Awaiting Customer Approval"}
              </p>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Applicable taxes and diagnostic assessment included.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Final Estimated Total
            </p>
            <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {estimate.currency} {formatMoney(estimate.total)}
            </p>
          </div>
        </div>
      </section>

      {/* Customer Decision Banner */}
      {isAwaiting && (
        <section className="rounded-[24px] border border-amber-300/80 bg-amber-50/50 p-6 sm:p-7">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Info className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-slate-900">Your decision is required</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Please review the itemised estimate carefully. By clicking{" "}
                <span className="font-bold text-slate-900">Approve Estimate</span>, you authorize
                our certified engineers to commence repairs immediately. Replaced parts include
                our 90-day comprehensive repair warranty.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onApprove}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 text-xs font-black text-white shadow-sm transition hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting
                    ? "Saving decision..."
                    : `Approve Estimate (${estimate.currency} ${formatMoney(estimate.total)})`}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onReject}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-6 text-xs font-black text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Reject / Request Revision
                </button>
              </div>

              <p className="mt-4 text-[11px] font-medium text-slate-500">
                Questions before approving? Call our workshop team at{" "}
                <a href="tel:+94112345678" className="font-bold text-blue-600 hover:underline">
                  +94 11 234 5678
                </a>{" "}
                referencing repair estimate.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Decision Summary Banner if already decided */}
      {!isAwaiting && (
        <section
          className={`rounded-[24px] border p-6 sm:p-7 ${
            isApproved
              ? "border-emerald-200 bg-emerald-50/60 text-emerald-950"
              : "border-rose-200 bg-rose-50/60 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isApproved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {isApproved ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-base font-black">
                You {isApproved ? "Approved" : "Rejected"} This Estimate
              </h3>
              <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-600">
                {isApproved
                  ? "Thank you for authorizing this repair. Our engineering team has been notified and work is underway."
                  : "You have declined this estimate version. Our customer support team will contact you regarding next steps."}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function formatFullDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatMoney(value: string) {
  const numeric = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function splitDescription(description: string) {
  const parts = description.split(/[-–—:]/);
  if (parts.length > 1) {
    return {
      title: parts[0]?.trim() || description,
      subtitle: parts.slice(1).join("-").trim(),
    };
  }
  return { title: description, subtitle: "" };
}