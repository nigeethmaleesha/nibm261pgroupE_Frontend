"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, kind, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(390px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? CircleAlert : Info;
          const tone =
            toast.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : toast.kind === "error"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-blue-200 bg-blue-50 text-blue-900";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rf-fade-up flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ${tone}`}
              role="status"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
