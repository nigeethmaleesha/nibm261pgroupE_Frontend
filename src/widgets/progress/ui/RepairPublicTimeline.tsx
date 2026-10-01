"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  History,
  Layers,
  Package,
  PackageCheck,
  ClockAlert,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Wrench,
  XCircle,
} from "lucide-react";
import type { PublicTrackingEvent, PublicTrackingEventType } from "@/src/shared/types/tracking";

type RepairPublicTimelineProps = {
  events: PublicTrackingEvent[];
};

function formatEventDate(iso: string) {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

function getEventStyle(eventType: PublicTrackingEventType) {
  switch (eventType) {
    case "INTAKE":
      return {
        icon: Package,
        color: "bg-blue-50 text-blue-600 border-blue-200",
        badge: "bg-blue-100 text-blue-800",
        nodeBg: "bg-blue-500 ring-4 ring-blue-100",
      };
    case "DIAGNOSIS":
      return {
        icon: Stethoscope,
        color: "bg-sky-50 text-sky-600 border-sky-200",
        badge: "bg-sky-100 text-sky-800",
        nodeBg: "bg-sky-500 ring-4 ring-sky-100",
      };
    case "ESTIMATE_ISSUED":
      return {
        icon: FileText,
        color: "bg-amber-50 text-amber-600 border-amber-200",
        badge: "bg-amber-100 text-amber-800",
        nodeBg: "bg-amber-500 ring-4 ring-amber-100",
      };
    case "ESTIMATE_APPROVED":
      return {
        icon: FileCheck,
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        badge: "bg-emerald-100 text-emerald-800",
        nodeBg: "bg-emerald-500 ring-4 ring-emerald-100",
      };
    case "ESTIMATE_REJECTED":
      return {
        icon: XCircle,
        color: "bg-rose-50 text-rose-600 border-rose-200",
        badge: "bg-rose-100 text-rose-800",
        nodeBg: "bg-rose-500 ring-4 ring-rose-100",
      };
    case "PROGRESS_UPDATE":
      return {
        icon: Wrench,
        color: "bg-violet-50 text-violet-600 border-violet-200",
        badge: "bg-violet-100 text-violet-800",
        nodeBg: "bg-violet-500 ring-4 ring-violet-100",
      };
    case "PARTS_DELAY":
      return {
        icon: ClockAlert,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        badge: "bg-amber-100 text-amber-900",
        nodeBg: "bg-amber-500 ring-4 ring-amber-100",
      };
    case "PARTS_ARRIVED":
      return {
        icon: PackageCheck,
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        badge: "bg-emerald-100 text-emerald-800",
        nodeBg: "bg-emerald-500 ring-4 ring-emerald-100",
      };
    case "READY_COLLECTION":
      return {
        icon: Sparkles,
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        badge: "bg-emerald-100 text-emerald-800",
        nodeBg: "bg-emerald-500 ring-4 ring-emerald-100",
      };
    case "READY_RETURN":
      return {
        icon: RotateCcw,
        color: "bg-teal-50 text-teal-600 border-teal-200",
        badge: "bg-teal-100 text-teal-800",
        nodeBg: "bg-teal-500 ring-4 ring-teal-100",
      };
    case "COLLECTED":
      return {
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-700 border-emerald-300",
        badge: "bg-emerald-200 text-emerald-950 font-black",
        nodeBg: "bg-emerald-600 ring-4 ring-emerald-100",
      };
    case "STATUS_CHANGE":
    default:
      return {
        icon: Layers,
        color: "bg-slate-50 text-slate-600 border-slate-200",
        badge: "bg-slate-100 text-slate-700",
        nodeBg: "bg-slate-400 ring-4 ring-slate-100",
      };
  }
}

export function RepairPublicTimeline({ events }: RepairPublicTimelineProps) {
  const [order, setOrder] = useState<"newest" | "oldest">("newest");

  const sortedEvents = useMemo(() => {
    const list = [...events];
    list.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.date || 0).getTime();
      const timeB = new Date(b.timestamp || b.date || 0).getTime();
      return order === "newest" ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [events, order]);

  if (events.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200/90 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <History className="h-6 w-6" />
        </div>
        <h4 className="mt-3 text-sm font-black text-slate-800">
          No Activity Milestones Yet
        </h4>
        <p className="mt-1 text-xs font-medium text-slate-400">
          Public milestones will be added automatically as the repair progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.03)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
              Public Activity & History Log
            </h3>
            <p className="text-[11px] font-medium text-slate-400">
              {events.length} milestone{events.length === 1 ? "" : "s"} recorded chronologically
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOrder(order === "newest" ? "oldest" : "newest")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowDownUp className="h-3.5 w-3.5 text-slate-500" />
          <span>Sort: {order === "newest" ? "Newest First" : "Oldest First"}</span>
        </button>
      </div>

      <div className="relative pl-2 sm:pl-4">
        {/* Timeline stem vertical bar */}
        <div className="absolute bottom-4 left-[23px] top-4 w-[2px] bg-slate-100 sm:left-[31px]" />

        <ol className="space-y-6">
          {sortedEvents.map((evt, idx) => {
            const { icon: EventIcon, badge, nodeBg } = getEventStyle(evt.eventType);
            const { date, time } = formatEventDate(evt.timestamp || evt.date || "");
            const isFirst = idx === 0;

            return (
              <li key={evt.id || idx} className="relative flex items-start gap-3.5 sm:gap-5">
                {/* Node icon */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-transform sm:h-9 sm:w-9 ${nodeBg}`}
                >
                  <EventIcon className="h-4 w-4" />
                </div>

                {/* Event Card */}
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-black text-slate-900 sm:text-[14px]">
                        {evt.title}
                      </span>
                      {isFirst && order === "newest" && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700">
                          Latest Update
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{date} {time ? `• ${time}` : ""}</span>
                    </div>
                  </div>

                  {evt.description && (
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600 sm:text-[13px]">
                      {evt.description}
                    </p>
                  )}

                  {evt.status && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Status at this stage:
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${badge}`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
