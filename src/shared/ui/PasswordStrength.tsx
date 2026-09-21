import { passwordScore } from "@/src/shared/lib/validation";

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  const labels = ["Start typing", "Basic", "Good", "Strong", "Excellent"];
  const widths = ["0%", "25%", "50%", "75%", "100%"];

  return (
    <div className="space-y-2">
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score <= 1
              ? "bg-amber-400"
              : score === 2
                ? "bg-blue-400"
                : score === 3
                  ? "bg-blue-600"
                  : "bg-emerald-500"
          }`}
          style={{ width: widths[score] }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-400">
        <span>Minimum 12 characters</span>
        <span>{labels[score]}</span>
      </div>
    </div>
  );
}
