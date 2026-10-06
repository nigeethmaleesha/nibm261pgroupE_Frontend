"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  FileText,
  MapPin,
  PackageCheck,
  ClockAlert,
  RotateCcw,
  ShieldCheck,
  Store,
  Wrench,
  X,
  CreditCard,
  IdCard,
} from "lucide-react";
import type {
  CollectionDetailsData,
  EstimateDecisionData,
  PartsDelayData,
} from "@/src/shared/types/tracking";

type RepairContextualCTAProps = {
  jobReference: string;
  status: string;
  actionRequired?: boolean;
  actionType?: string | null;
  actionMessage?: string | null;
  estimateDecision?: EstimateDecisionData | null;
  partsDelay?: PartsDelayData | null;
  publicDelayReason?: string | null;
  handoverInstruction?: string | null;
  collection?: CollectionDetailsData | null;
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "Date not recorded";
  try {
    return new Date(iso).toLocaleString("en-GB", {
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

export function RepairContextualCTA({
  jobReference,
  status,
  actionRequired = false,
  actionType,
  actionMessage,
  estimateDecision,
  partsDelay,
  publicDelayReason,
  handoverInstruction,
  collection,
}: RepairContextualCTAProps) {
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyReference = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(jobReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. SCENARIO A: Awaiting Approval / Action Required
  const isAwaitingApproval =
    status === "Awaiting Approval" ||
    actionRequired ||
    actionType === "ESTIMATE_DECISION";

  if (isAwaitingApproval) {
    const formattedTotal = estimateDecision?.total
      ? !estimateDecision.total.startsWith("LKR")
        ? `LKR ${Number(estimateDecision.total).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : estimateDecision.total
      : null;

    return (
      <div className="relative overflow-hidden rounded-[24px] border-2 border-amber-300 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 p-5 shadow-[0_12px_36px_rgba(245,158,11,0.12)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Action Required
                </span>
                <span className="text-[11px] font-bold text-amber-800">
                  Customer Decision Pending
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                Repair Estimate Awaiting Your Approval
              </h3>
              <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-slate-600 sm:text-sm">
                {actionMessage ||
                  "The technician has completed diagnosis and issued an itemised repair estimate. Please review and approve the cost to begin repair."}
              </p>

              {formattedTotal && (
                <div className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-amber-100/80 px-3 py-1.5 text-xs font-bold text-amber-950">
                  <FileText className="h-4 w-4 text-amber-700" />
                  <span>Total Estimate:</span>
                  <span className="font-mono text-sm font-extrabold text-amber-900">
                    {formattedTotal}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <Link
              id="cta-review-estimate-btn"
              href={`/repair-jobs/${encodeURIComponent(jobReference)}/estimate`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-600 hover:shadow-amber-500/40 active:scale-[0.98] sm:w-auto"
            >
              Review Estimate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCENARIO B: Waiting for Parts (Parts Delay)
  const isPartsDelay =
    status === "Waiting for Parts" || Boolean(partsDelay) || Boolean(publicDelayReason);

  if (isPartsDelay && status !== "Collected" && status !== "Ready for Collection" && status !== "Ready for Return") {
    const requiredPart = partsDelay?.requiredPart;
    const reasonText = publicDelayReason || partsDelay?.reason;

    return (
      <div className="relative overflow-hidden rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50/90 to-sky-50/50 p-5 shadow-[0_8px_30px_rgba(59,130,246,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <ClockAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Parts on Order
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  No action required
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                Repair Temporarily Paused — Awaiting Replacement Components
              </h3>
              {requiredPart && (
                <p className="mt-1 text-xs font-bold text-blue-900">
                  Required Component: <span className="underline decoration-blue-300">{requiredPart}</span>
                </p>
              )}
              <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
                {reasonText ||
                  "A required part has been requested from our certified parts supply. Work will resume immediately once delivered."}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-blue-100 bg-white/80 px-3.5 py-2.5 text-right text-xs font-medium text-slate-600">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Status</span>
            <span className="font-bold text-blue-700">Awaiting Part Arrival</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. SCENARIO C: Ready for Collection or Ready for Return
  const isReadyForCollection = status === "Ready for Collection";
  const isReadyForReturn = status === "Ready for Return";

  if (isReadyForCollection || isReadyForReturn) {
    const isSuccess = isReadyForCollection;

    return (
      <>
        <div
          className={`relative overflow-hidden rounded-[24px] border-2 p-5 sm:p-6 ${
            isSuccess
              ? "border-emerald-300 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 shadow-[0_12px_36px_rgba(16,185,129,0.12)]"
              : "border-amber-300 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 shadow-[0_12px_36px_rgba(245,158,11,0.12)]"
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                  isSuccess
                    ? "bg-emerald-600 shadow-emerald-600/30"
                    : "bg-amber-600 shadow-amber-600/30"
                }`}
              >
                {isSuccess ? <PackageCheck className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${
                      isSuccess ? "bg-emerald-600" : "bg-amber-600"
                    }`}
                  >
                    {isSuccess ? "Ready for Collection" : "Ready for Pickup (Unrepaired)"}
                  </span>
                  <span className={`text-[11px] font-bold ${isSuccess ? "text-emerald-800" : "text-amber-800"}`}>
                    {isSuccess ? "Service Centre Handover" : "Unrepaired Return Handover"}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                  {isSuccess
                    ? "Your Device Repair is Complete & Ready for Collection! 🎉"
                    : "Your Device is Ready for Pickup (Unrepaired)"}
                </h3>
                <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-slate-700 sm:text-sm">
                  {handoverInstruction ||
                    "Your device is ready at our service centre. Please visit with your repair reference and photo ID to collect your device."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                id="cta-pickup-device-btn"
                onClick={() => setShowPickupModal(true)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black text-white shadow-lg transition-all active:scale-[0.98] sm:w-auto ${
                  isSuccess
                    ? "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-emerald-600/40"
                    : "bg-amber-600 shadow-amber-600/25 hover:bg-amber-700"
                }`}
              >
                <Store className="h-4 w-4" />
                Pickup Device Instructions
              </button>
            </div>
          </div>
        </div>

        {/* Pickup Modal */}
        {showPickupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
              <button
                type="button"
                onClick={() => setShowPickupModal(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <PackageCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    Device Pickup Instructions
                  </h4>
                  <p className="text-xs font-medium text-slate-400">
                    Prepare the following items before visiting our centre
                  </p>
                </div>
              </div>

              {/* Handover Instruction Quote */}
              {handoverInstruction && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-xs font-semibold leading-relaxed text-emerald-950">
                  {handoverInstruction}
                </div>
              )}

              {/* Checklist */}
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                    #
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">1. Repair Reference Number</p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-white px-2 py-0.5 text-xs font-mono font-bold text-blue-700 border border-slate-200">
                        {jobReference}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="inline-flex items-center gap-1 rounded bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-300"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <IdCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">2. Valid Photo Identification</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      National Identity Card (NIC), Passport, or Driver&apos;s License matching the account holder.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">3. Settle Any Outstanding Balance</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      Cash, Credit/Debit cards, or QR digital payments are accepted at the front desk.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Service Centre Hours & Location</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      RepairFlow Hub: Mon – Sat (9:00 AM – 6:30 PM). Closed on Sundays and Poya days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Close Instructions
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 4. SCENARIO D: Collected (Complete)
  if (status === "Collected") {
    const isRepaired = collection?.outcome === "repaired";
    const collectedTimestamp = collection?.collectedAt || collection?.collectionTime;

    return (
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/30 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    isRepaired
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {isRepaired ? "Repaired & Handed Over" : "Returned Unrepaired"}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Collected on {formatDateTime(collectedTimestamp)}
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                Device Handover Complete
              </h3>
              <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
                {collection?.outcomeDescription ||
                  "Device was successfully collected by customer. Thank you for choosing RepairFlow!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Service Record Archived</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. SCENARIO E: In Repair
  if (status === "In Repair") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-violet-200 bg-gradient-to-br from-violet-50/70 to-indigo-50/40 p-5 shadow-[0_8px_30px_rgba(139,92,246,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/20">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-700">
                  Work in Progress
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Certified Technician
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                Repair Work Actively Underway
              </h3>
              <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
                The technician is carrying out repairs according to the approved estimate. You will receive milestone updates as tasks are completed.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white/80 px-3.5 py-2 text-xs font-bold text-violet-700">
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-ping" />
            Active Service Session
          </div>
        </div>
      </div>
    );
  }

  // 6. SCENARIO F: Diagnosing
  if (status === "Diagnosing") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-sky-200 bg-gradient-to-br from-sky-50/70 to-blue-50/40 p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-700">
                Inspection
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Bench Testing
              </span>
            </div>
            <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
              Hardware Diagnostics in Progress
            </h3>
            <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              Our technician is testing device components and inspecting circuitry. An itemised estimate will be generated once diagnostic tests complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback card
  return null;
}
