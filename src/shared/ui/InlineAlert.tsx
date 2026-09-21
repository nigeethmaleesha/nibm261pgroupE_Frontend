import { CircleAlert, CircleCheck, Info } from "lucide-react";

export function InlineAlert({
  kind = "error",
  children,
}: {
  kind?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const Icon = kind === "success" ? CircleCheck : kind === "info" ? Info : CircleAlert;
  const classes =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : kind === "info"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[13px] font-semibold leading-5 ${classes}`} role="alert">
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
