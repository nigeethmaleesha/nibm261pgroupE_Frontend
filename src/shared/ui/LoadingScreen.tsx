import { BrandLogo } from "./BrandLogo";

export function LoadingScreen({ label = "Checking your secure session..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7faff] px-5">
      <div className="text-center">
        <div className="mb-5 flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(37,99,235,0.12)]">
            <BrandLogo />
          </div>
        </div>
        <div className="mx-auto h-1.5 w-44 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}
