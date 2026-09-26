import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  wide?: boolean;
  compact?: boolean;
};

export function AuthShell({
  eyebrow = "Secure customer access",
  title,
  description,
  children,
  backHref,
  backLabel = "Back",
  wide = false,
  compact = false,
}: AuthShellProps) {
  return (
    <main
      className={`rf-hide-scrollbar relative h-[100dvh] min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#f7faff] text-slate-950 ${
        compact ? "lg:overflow-y-hidden" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rf-grid opacity-70" />

      <div className="pointer-events-none absolute -left-28 -top-28 h-[360px] w-[360px] rounded-full border-[62px] border-blue-500/[0.06]" />
      <div className="pointer-events-none absolute -right-36 top-[16%] h-[420px] w-[420px] rounded-full border-[72px] border-cyan-400/[0.06]" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-52 w-52 rounded-full bg-blue-500/[0.07] blur-3xl rf-animate-float" />
      <div className="pointer-events-none absolute bottom-[8%] right-[10%] h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-3xl rf-animate-float-slow" />
      <div className="pointer-events-none absolute bottom-[-230px] left-1/2 h-[460px] w-[920px] -translate-x-1/2 rounded-[50%] bg-blue-600/[0.06] blur-3xl" />

      <section
        className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-6 lg:px-8 ${
          compact
            ? "min-h-[100dvh] py-5 lg:h-[100dvh] lg:min-h-0 lg:py-4"
            : "min-h-screen py-10 sm:py-12 lg:py-14"
        }`}
      >
        <div className={`flex w-full flex-col items-center ${wide ? "max-w-[760px]" : "max-w-[520px]"}`}>
          <div
            className={`rf-fade-up inline-flex rounded-[20px] border border-white bg-white/95 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl ${
              compact ? "mb-4 px-4 py-3" : "mb-7 px-5 py-4 sm:mb-8"
            }`}
          >
            <BrandLogo />
          </div>

          <div className={`rf-fade-up w-full text-center ${compact ? "mb-4" : "mb-7 sm:mb-8"}`}>
            <h1
              className={`font-black leading-[1.08] tracking-[-0.045em] text-slate-950 ${
                compact ? "text-[30px] sm:text-[34px]" : "text-[31px] sm:text-[38px]"
              }`}
            >
              {title}
            </h1>

            {description && (
              <div
                className={`mx-auto max-w-[650px] font-medium text-slate-500 ${
                  compact
                    ? "mt-2 text-[13px] leading-5"
                    : "mt-3 text-[14px] leading-6 sm:text-[15px]"
                }`}
              >
                {description}
              </div>
            )}
          </div>

          <div className="w-full">
            {backHref && (
              <div className={compact ? "mb-3 flex justify-start" : "mb-4 flex justify-start"}>
                <Link
                  href={backHref}
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 py-1.5 pl-1.5 pr-3.5 text-[13px] font-bold text-slate-600 shadow-[0_6px_18px_rgba(15,23,42,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-[0_9px_24px_rgba(37,99,235,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  </span>
                  <span>{backLabel}</span>
                </Link>
              </div>
            )}

            <div
              className={`rf-fade-up relative overflow-hidden border border-white/95 bg-white/94 shadow-[0_28px_80px_rgba(30,64,175,0.12),0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl ${
                compact
                  ? "rounded-[24px] p-5 sm:p-6"
                  : "rounded-[28px] p-6 sm:p-8 lg:p-9"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-400" />

              <div className={`flex justify-center ${compact ? "mb-5" : "mb-7 sm:mb-8"}`}>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {eyebrow}
                </div>
              </div>

              {children}
            </div>
          </div>

          <p className={`text-center text-xs font-semibold text-slate-400 ${compact ? "mt-4" : "mt-6 sm:mt-7"}`}>
            © 2026 RepairFlow. Secure customer repair management.
          </p>
        </div>
      </section>
    </main>
  );
}
