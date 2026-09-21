import { Wrench, Workflow } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3" aria-label="RepairFlow">
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_12px_28px_rgba(37,99,235,0.25)]">
        <Workflow className="h-6 w-6 text-white" strokeWidth={2.2} />
        <div className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-950">
          <Wrench className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
        </div>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[22px] font-black tracking-[-0.045em] text-slate-950">
            Repair<span className="text-blue-600">Flow</span>
          </div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Customer Portal
          </div>
        </div>
      )}
    </div>
  );
}
