"use client";

// SCRUM-125: "Past Repairs" tab for customer dashboard with searchable reference numbers

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { getCompletedJobsHistory } from "@/src/shared/api/jobHistory.api";
import type { CompletedRepairRecord } from "@/src/shared/types/jobHistory";
import { PastRepairSummaryCard } from "./PastRepairSummaryCard";

type OutcomeFilter = "all" | "repaired" | "unrepaired";

export function PastRepairsTab() {
  const [records, setRecords] = useState<CompletedRepairRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadHistory = () => {
    setIsLoading(true);
    setError(null);
    getCompletedJobsHistory()
      .then((res) => {
        setRecords(res.jobs);
        setLastRefreshed(new Date());
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load repair history.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    getCompletedJobsHistory()
      .then((res) => {
        if (active) {
          setRecords(res.jobs);
          setLastRefreshed(new Date());
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load repair history.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Filter records based on search query and outcome selection
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((rec) => {
      // 1. Outcome filter
      const isRepaired =
        (rec.outcome || "").toLowerCase() === "repaired" ||
        (rec.outcomeDisplay || "").toLowerCase().includes("repaired") &&
          !(rec.outcomeDisplay || "").toLowerCase().includes("unrepaired");

      if (outcomeFilter === "repaired" && !isRepaired) return false;
      if (outcomeFilter === "unrepaired" && isRepaired) return false;

      // 2. Search query matching: reference, make/model, serial number, reported fault, summary
      if (!query) return true;

      const refMatch = (rec.reference || "").toLowerCase().includes(query);
      const brandMatch = (rec.device?.brand || "").toLowerCase().includes(query);
      const modelMatch = (rec.device?.model || "").toLowerCase().includes(query);
      const serialMatch = (rec.device?.serialNumber || "").toLowerCase().includes(query);
      const faultMatch = (rec.reportedFault || "").toLowerCase().includes(query);
      const summaryMatch = (rec.publicRepairSummary || "").toLowerCase().includes(query);

      return (
        refMatch ||
        brandMatch ||
        modelMatch ||
        serialMatch ||
        faultMatch ||
        summaryMatch
      );
    });
  }, [records, searchQuery, outcomeFilter]);

  const repairedCount = useMemo(() => {
    return records.filter(
      (r) =>
        (r.outcome || "").toLowerCase() === "repaired" ||
        (r.outcomeDisplay || "").toLowerCase().includes("repaired") &&
          !(r.outcomeDisplay || "").toLowerCase().includes("unrepaired")
    ).length;
  }, [records]);

  const unrepairedCount = records.length - repairedCount;

  return (
    <section className="space-y-6">
      {/* Tab Header & Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
            <History className="h-3.5 w-3.5" />
            SCRUM-125 Archive Records
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Past Repairs &amp; Collection Receipts
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Access verified handover logs, outcome determinations, itemized service receipts, and warranty details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="hidden text-[11px] font-semibold text-slate-400 sm:inline-block">
              Updated {lastRefreshed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            onClick={loadHistory}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-slate-50 disabled:opacity-60"
            title="Refresh past repair records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Outcome Filters */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.03)] sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Searchable reference input (SCRUM-125 core requirement) */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search-past-repairs-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job reference (e.g. JOB-202610-0001), model, or fault..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-blue-100 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Outcome Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="filter-outcome-all"
              onClick={() => setOutcomeFilter("all")}
              className={`rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                outcomeFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              All Records ({records.length})
            </button>

            <button
              type="button"
              id="filter-outcome-repaired"
              onClick={() => setOutcomeFilter("repaired")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                outcomeFilter === "repaired"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Repaired ({repairedCount})
            </button>

            <button
              type="button"
              id="filter-outcome-unrepaired"
              onClick={() => setOutcomeFilter("unrepaired")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                outcomeFilter === "unrepaired"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Unrepaired ({unrepairedCount})
            </button>
          </div>
        </div>

        {/* Filter stats & helper feedback */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
          <span>
            {searchQuery
              ? `Showing ${filteredRecords.length} matching result${filteredRecords.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : `Showing ${filteredRecords.length} completed repair job${filteredRecords.length !== 1 ? "s" : ""}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            Records retained permanently for warranty &amp; tax purposes
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          <p className="mt-3 text-sm font-bold text-slate-700">Loading your completed repair history…</p>
          <p className="mt-1 text-xs text-slate-400">Retrieving digital collection receipts and warranty records.</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-rose-200 bg-rose-50/70 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="mt-3 text-base font-extrabold text-rose-900">Failed to load repair history</p>
          <p className="mt-1 text-xs font-medium text-rose-700">{error}</p>
          <button
            type="button"
            onClick={loadHistory}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State: No records match search query */}
      {!isLoading && !error && records.length > 0 && filteredRecords.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <PackageSearch className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-extrabold text-slate-800">
            No matching past repairs
          </h3>
          <p className="mt-1 max-w-[360px] text-xs font-medium text-slate-500">
            No completed records matched your reference or filter query. Check the reference code and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setOutcomeFilter("all");
            }}
            className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Empty State: Zero history records in account */}
      {!isLoading && !error && records.length === 0 && (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
            <History className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-800">
            No past repair records found
          </h3>
          <p className="mt-1.5 max-w-[420px] text-xs font-medium leading-relaxed text-slate-500">
            When you pick up a repaired or inspected device from our RepairFlow service centre, the completed job handover receipt and warranty certification will appear here automatically.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-[11px] font-bold text-slate-600">
            <span>Active service tickets can be tracked under &ldquo;My Repair Jobs&rdquo;</span>
          </div>
        </div>
      )}

      {/* List of Read-only Summary Cards */}
      {!isLoading && !error && filteredRecords.length > 0 && (
        <div className="space-y-6">
          {filteredRecords.map((record) => (
            <PastRepairSummaryCard key={record.reference} record={record} />
          ))}
        </div>
      )}
    </section>
  );
}
