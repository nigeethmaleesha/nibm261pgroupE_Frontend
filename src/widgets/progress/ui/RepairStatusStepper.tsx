"use client";

import { useMemo } from "react";
import {
  Check,
  ClipboardCheck,
  Stethoscope,
  FileCheck2,
  Wrench,
  PackageCheck,
  CheckCircle2,
  ClockAlert,
  XCircle,
  RotateCcw,
} from "lucide-react";

type RepairStatusStepperProps = {
  currentStatus: string;
  partsDelayActive?: boolean;
  isReturn?: boolean;
  isRejected?: boolean;
  receivedAt?: string;
  updatedAt?: string;
};

type StepConfig = {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof ClipboardCheck;
};

export function RepairStatusStepper({
  currentStatus,
  partsDelayActive = false,
  isReturn = false,
  isRejected = false,
}: RepairStatusStepperProps) {
  // Determine current stage index: 0 to 5
  const activeStageIndex = useMemo(() => {
    switch (currentStatus) {
      case "Received":
        return 0;
      case "Diagnosing":
        return 1;
      case "Awaiting Approval":
        return 2;
      case "Approved":
        // Approved moves past estimate review, preparing for or beginning repair
        return 3;
      case "Estimate Rejected":
        return 2;
      case "In Repair":
      case "Waiting for Parts":
        return 3;
      case "Ready for Collection":
      case "Ready for Return":
        return 4;
      case "Collected":
        return 5;
      default:
        return 0;
    }
  }, [currentStatus]);

  const steps: StepConfig[] = useMemo(() => {
    return [
      {
        id: "received",
        label: "Received",
        sublabel: "Intake logged",
        icon: ClipboardCheck,
      },
      {
        id: "diagnosing",
        label: "Diagnosis",
        sublabel: "Device inspection",
        icon: Stethoscope,
      },
      {
        id: "approval",
        label: isRejected
          ? "Estimate Declined"
          : currentStatus === "Approved"
          ? "Estimate Approved"
          : "Estimate Review",
        sublabel: isRejected
          ? "Customer declined"
          : currentStatus === "Approved"
          ? "Customer agreed"
          : "Customer decision",
        icon: isRejected ? XCircle : FileCheck2,
      },
      {
        id: "repair",
        label: partsDelayActive || currentStatus === "Waiting for Parts"
          ? "Parts Delay"
          : "In Repair",
        sublabel: partsDelayActive || currentStatus === "Waiting for Parts"
          ? "Awaiting shipment"
          : "Hardware & testing",
        icon: partsDelayActive || currentStatus === "Waiting for Parts"
          ? ClockAlert
          : Wrench,
      },
      {
        id: "pickup",
        label: isReturn || currentStatus === "Ready for Return"
          ? "Ready for Return"
          : "Ready for Pickup",
        sublabel: isReturn || currentStatus === "Ready for Return"
          ? "Return handover"
          : "Quality verified",
        icon: isReturn || currentStatus === "Ready for Return"
          ? RotateCcw
          : PackageCheck,
      },
      {
        id: "collected",
        label: "Completed",
        sublabel: "Device collected",
        icon: CheckCircle2,
      },
    ];
  }, [currentStatus, isRejected, isReturn, partsDelayActive]);

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.03)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Repair Progress Stepper
          </span>
          <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Live Repair Lifecycle
          </h3>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Current: <strong className="text-slate-900">{currentStatus}</strong></span>
        </div>
      </div>

      {/* Desktop / Tablet Horizontal Stepper (>= 640px) */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* Progress bar background line */}
          <div className="absolute left-6 right-6 top-5 -z-0 h-1 bg-slate-100" />
          {/* Active progress bar line */}
          <div
            className="absolute left-6 top-5 -z-0 h-1 bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500 ease-out"
            style={{
              width: `${(activeStageIndex / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < activeStageIndex;
            const isCurrent = index === activeStageIndex;
            const StepIcon = step.icon;

            let circleClass = "border-2 border-slate-200 bg-white text-slate-400";
            if (isCompleted) {
              circleClass = "bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm";
            } else if (isCurrent) {
              if (isRejected && step.id === "approval") {
                circleClass = "bg-rose-500 text-white border-2 border-rose-500 ring-4 ring-rose-100 shadow-md";
              } else if (partsDelayActive && step.id === "repair") {
                circleClass = "bg-amber-500 text-white border-2 border-amber-500 ring-4 ring-amber-100 shadow-md";
              } else {
                circleClass = "bg-blue-600 text-white border-2 border-blue-600 ring-4 ring-blue-100 shadow-md";
              }
            }

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-1 flex-col items-center text-center first:items-start last:items-end"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${circleClass}`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="h-4.5 w-4.5" />
                  )}
                </div>

                <div className="mt-2.5 max-w-[100px] text-center">
                  <p
                    className={`text-[12px] font-extrabold leading-tight ${
                      isCurrent
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">
                    {step.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-First Vertical Stepper (< 640px, safe for >= 360px without overflow) */}
      <div className="block sm:hidden">
        <ol className="relative space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < activeStageIndex;
            const isCurrent = index === activeStageIndex;
            const isUpcoming = index > activeStageIndex;
            const isLast = index === steps.length - 1;
            const StepIcon = step.icon;

            let circleClass = "border-2 border-slate-200 bg-white text-slate-400";
            let statusPillClass = "bg-slate-100 text-slate-500";
            let statusLabel = "Upcoming";

            if (isCompleted) {
              circleClass = "bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm";
              statusPillClass = "bg-emerald-50 text-emerald-700";
              statusLabel = "Completed";
            } else if (isCurrent) {
              if (isRejected && step.id === "approval") {
                circleClass = "bg-rose-500 text-white border-2 border-rose-500 ring-4 ring-rose-100";
                statusPillClass = "bg-rose-50 text-rose-700";
                statusLabel = "Declined";
              } else if (partsDelayActive && step.id === "repair") {
                circleClass = "bg-amber-500 text-white border-2 border-amber-500 ring-4 ring-amber-100";
                statusPillClass = "bg-amber-50 text-amber-800";
                statusLabel = "On Hold";
              } else {
                circleClass = "bg-blue-600 text-white border-2 border-blue-600 ring-4 ring-blue-100";
                statusPillClass = "bg-blue-50 text-blue-700 animate-pulse";
                statusLabel = "Current Stage";
              }
            }

            return (
              <li key={step.id} className="relative flex items-start gap-3.5">
                {/* Connecting track line */}
                {!isLast && (
                  <span
                    className={`absolute left-[17px] top-[36px] -bottom-[16px] w-[2px] -translate-x-1/2 transition-colors ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Node icon */}
                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform ${circleClass} ${
                    isCurrent ? "scale-105" : ""
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <p
                      className={`text-[13px] font-black truncate ${
                        isCurrent
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusPillClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] font-medium leading-relaxed ${
                      isUpcoming ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {step.sublabel}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
