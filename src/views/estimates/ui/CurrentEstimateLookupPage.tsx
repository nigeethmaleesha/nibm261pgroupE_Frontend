"use client";

import { ArrowRight, FileSearch, ReceiptText, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/src/shared/auth/ProtectedRoute";
import { DashboardShell } from "@/src/widgets/dashboard/ui/DashboardShell";

export function CurrentEstimateLookupPage() {
  return (
    <ProtectedRoute>
      <CurrentEstimateLookupContent />
    </ProtectedRoute>
  );
}

function CurrentEstimateLookupContent() {
  const router = useRouter();
  const [jobIdentifier, setJobIdentifier] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = jobIdentifier.trim();

    if (!value) {
      setError("Enter your repair job reference or job ID.");
      return;
    }

    setError("");
    router.push(`/repair-jobs/${encodeURIComponent(value)}/estimate`);
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[920px]">
        <div className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600">
            SCRUM-15 · Customer estimate
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            View current estimate
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Enter the repair job reference supplied by RepairFlow to review the latest issued estimate and its current decision state.
          </p>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Find your estimate</h2>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Only repair jobs belonging to your signed-in account can be opened.</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="p-6 sm:p-8">
            <label htmlFor="jobIdentifier" className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              Repair job reference or ID
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FileSearch className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="jobIdentifier"
                  value={jobIdentifier}
                  onChange={(event) => setJobIdentifier(event.target.value)}
                  placeholder="Example: RF-2026-000123"
                  autoComplete="off"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700"
              >
                Open estimate <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {error && <p className="mt-2 text-[12px] font-bold text-rose-600">{error}</p>}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-[12px] font-semibold leading-5 text-slate-600">
                The server checks ownership before returning estimate data. Internal diagnosis notes and staff-only fields are not included in this customer view.
              </p>
            </div>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
