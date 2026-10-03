"use client";

// SCRUM-125: Read-only summary card for completed repair records showing outcome badge & collection receipt details

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Check,
  FileCheck,
  FileText,
  Package,
  Printer,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import type { CompletedRepairRecord } from "@/src/shared/types/jobHistory";

interface PastRepairSummaryCardProps {
  record: CompletedRepairRecord;
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatDateOnly(dateStr?: string | null) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: string | number | undefined, currency = "LKR") {
  if (amount === undefined || amount === null) return "—";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return `${currency} ${amount}`;
  return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PastRepairSummaryCard({ record }: PastRepairSummaryCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showItemized, setShowItemized] = useState(false);

  const isRepaired =
    (record.outcome || "").toLowerCase() === "repaired" ||
    (record.outcomeDisplay || "").toLowerCase().includes("repaired") &&
      !(record.outcomeDisplay || "").toLowerCase().includes("unrepaired");

  const collectionTimestamp = record.collectedAt || record.collectionTime;
  const estimate = record.latestEstimate;
  const items = estimate?.items || [];
  const hasItems = items.length > 0;

  const handleCopyReference = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(record.reference);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <article
      id={`past-repair-${record.reference}`}
      className="group relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)] print:border print:shadow-none sm:p-7"
    >
      {/* Top Header Row: Reference, Handover timestamp, and Outcome Badge */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              {record.reference}
            </span>
            <button
              type="button"
              onClick={handleCopyReference}
              aria-label="Copy job reference"
              title="Copy job reference"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 print:hidden"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-slate-400" />
              <strong className="font-extrabold text-slate-700">
                {record.device?.brand} {record.device?.model}
              </strong>
            </span>
            {record.device?.serialNumber && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-slate-400">
                  SN: {record.device.serialNumber}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Outcome Badge (SCRUM-125 core requirement: Repaired vs Unrepaired) */}
        <div className="flex flex-col items-end gap-1.5">
          {isRepaired ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{record.outcomeDisplay || "Repaired"}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-900 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
              <span>{record.outcomeDisplay || "Unrepaired"}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <FileCheck className="h-3 w-3 text-slate-400" />
            <span>Collection Status: Collected</span>
          </div>
        </div>
      </div>

      {/* Outcome Description Banner */}
      {record.outcomeDescription && (
        <div
          className={`mt-4 rounded-2xl p-4 text-xs font-medium leading-relaxed ${
            isRepaired
              ? "border border-emerald-100 bg-emerald-50/60 text-emerald-900"
              : "border border-amber-200 bg-amber-50/70 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isRepaired ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
            )}
            <p className="font-medium">{record.outcomeDescription}</p>
          </div>
        </div>
      )}

      {/* Collection Receipt Details Grid */}
      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Collection Handover Date & Time */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Handover Completed
          </div>
          <p className="text-xs font-bold text-slate-800">
            {formatDateTime(collectionTimestamp)}
          </p>
        </div>

        {/* Reported Problem / Intake Diagnosis */}
        <div className="space-y-1 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Reported Issue
          </div>
          <p className="line-clamp-2 text-xs font-medium text-slate-700">
            {record.reportedFault || "Diagnostic assessment completed."}
          </p>
        </div>

        {/* Technical Resolution / Handover Work Summary */}
        {record.publicRepairSummary && (
          <div className="col-span-full space-y-1 rounded-xl border border-slate-200/80 bg-white p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-600">
              <Wrench className="h-3.5 w-3.5 text-blue-500" />
              Technician Resolution Summary
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-800">
              {record.publicRepairSummary}
            </p>
          </div>
        )}

        {/* Non-Repair Return Reason / Notes (if unrepaired) */}
        {!isRepaired && (record.returnReason || record.returnNotes) && (
          <div className="col-span-full space-y-1 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-amber-900">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800">
              <Package className="h-3.5 w-3.5 text-amber-700" />
              Return Release Notes
            </div>
            {record.returnReason && (
              <p className="text-xs font-bold">
                Reason: {record.returnReason}
              </p>
            )}
            {record.returnNotes && (
              <p className="text-xs font-medium text-amber-800/90">
                {record.returnNotes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Financial & Settlement Details Section */}
      {estimate && (
        <div className="mt-5 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Total Settlement Amount
                </span>
                {estimate.status && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                    {estimate.status}
                  </span>
                )}
              </div>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                {formatCurrency(estimate.total, estimate.currency)}
              </p>
            </div>

            <div className="text-right text-xs">
              {estimate.customerDecision && (
                <div className="text-slate-500 font-medium">
                  Customer Authorization:{" "}
                  <span className="font-extrabold text-slate-800">
                    {estimate.customerDecision.action}
                  </span>
                  {estimate.customerDecision.decidedAt && (
                    <div className="text-[11px] text-slate-400">
                      Approved on {formatDateOnly(estimate.customerDecision.decidedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Toggleable Itemized Breakdown */}
          {hasItems && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowItemized(!showItemized)}
                className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 transition hover:text-blue-700 print:hidden"
              >
                {showItemized ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Itemized Receipt Breakdown
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View Itemized Receipt Breakdown ({items.length} item{items.length > 1 ? "s" : ""})
                  </>
                )}
              </button>

              {(showItemized || typeof window === "undefined") && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="px-3 py-2">Item Description</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={idx} className="font-medium text-slate-700">
                          <td className="px-3 py-2 font-semibold text-slate-800">
                            {item.description}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-500">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600">
                            {formatCurrency(item.unitPrice, estimate.currency)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(item.totalPrice, estimate.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Card Footer: Warranty guarantee, Print receipt button, and details navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 print:hidden">
        <div className="flex items-center gap-2">
          {isRepaired ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>90-Day Parts &amp; Service Warranty</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
              <Package className="h-3.5 w-3.5 text-slate-500" />
              <span>Diagnostic Closed · Returned Unrepaired</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
            title="Print collection receipt"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            Print Receipt
          </button>

          <Link
            href={`/repair-jobs/${encodeURIComponent(record.reference)}/estimate`}
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-blue-700"
          >
            Estimate Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
