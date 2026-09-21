import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};

export function PrimaryButton({ loading, children, disabled, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`group relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(37,99,235,0.23)] outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(37,99,235,0.3)] focus-visible:ring-4 focus-visible:ring-blue-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-[-35%] w-[28%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:[animation:rf-shimmer_1.2s_ease-out]" />
      <span className="relative flex items-center justify-center gap-2">
        {loading && <LoaderCircle className="h-4.5 w-4.5 animate-spin" />}
        {children}
      </span>
    </button>
  );
}
