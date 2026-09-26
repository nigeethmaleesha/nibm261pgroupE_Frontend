"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, ReactNode, useState } from "react";

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  icon?: ReactNode;
  error?: string | null;
  hint?: string;
  passwordToggle?: boolean;
};

export function FormField({
  label,
  icon,
  error,
  hint,
  passwordToggle,
  type,
  id,
  required,
  className = "",
  ...props
}: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputType = passwordToggle ? (visible ? "text" : "password") : type;
  const fieldId = id || props.name;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="text-[13px] font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[11px] font-semibold text-slate-400">{hint}</span>}
      </div>

      <div className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-4 z-10 text-slate-400">{icon}</span>}
        <input
          id={fieldId}
          type={inputType}
          required={required}
          aria-invalid={Boolean(error)}
          {...props}
          className={`h-[52px] w-full rounded-[14px] border bg-slate-50/70 px-4 text-[14px] font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:bg-white focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
            icon ? "pl-11" : ""
          } ${passwordToggle ? "pr-12" : ""} ${
            error
              ? "border-rose-300 shadow-[0_0_0_4px_rgba(244,63,94,0.07)] focus:border-rose-400"
              : "border-slate-200 focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
          } ${className}`}
        />
        {passwordToggle && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>

      {error && <p className="text-[12px] font-semibold leading-5 text-rose-600">{error}</p>}
    </div>
  );
}
