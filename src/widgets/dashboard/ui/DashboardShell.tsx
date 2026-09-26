"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, ClipboardList, FileText, LogOut, Menu, Wrench, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/src/shared/auth/AuthProvider";
import { BrandLogo } from "@/src/shared/ui/BrandLogo";
import { useToast } from "@/src/shared/ui/ToastProvider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    toast.success("You have been signed out securely.");
    router.replace("/login");
  };

  const initials = (user?.fullName || "RF")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <div className="fixed inset-x-0 top-0 z-40 h-[72px] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandLogo />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
            </button>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 sm:px-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-black text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)]">
                {initials}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[180px] truncate text-[12px] font-extrabold text-slate-800">{user?.fullName}</p>
                <p className="max-w-[180px] truncate text-[10px] font-semibold text-slate-400">Customer account</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] pt-[72px]">
        <aside className="fixed bottom-0 top-[72px] z-30 hidden w-[248px] border-r border-slate-200/80 bg-white px-4 py-6 lg:block">
          <NavContent onLogout={handleLogout} loggingOut={isLoggingOut} pathname={pathname} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Close navigation overlay" className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-[280px] bg-white p-5 shadow-2xl rf-fade-up">
              <div className="mb-7 flex items-center justify-between">
                <BrandLogo />
                <button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavContent onLogout={handleLogout} loggingOut={isLoggingOut} pathname={pathname} />
            </aside>
          </div>
        )}

        <main className="min-h-[calc(100vh-72px)] w-full px-4 py-7 sm:px-6 lg:ml-[248px] lg:px-8 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavContent({ onLogout, loggingOut, pathname }: { onLogout: () => void; loggingOut: boolean; pathname: string }) {
  // exact=true → only highlight when path is identical so /repair-jobs doesn't
  // stay active while on /repair-jobs/estimate.
  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const navItem = (href: string, icon: React.ReactNode, label: string, exact = false) => {
    const active = isActive(href, exact);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
          active
            ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)]"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <nav className="space-y-2">
        <div className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Customer workspace</div>
        {navItem("/dashboard", <Wrench className="h-4.5 w-4.5" />, "Dashboard")}
        {navItem("/repair-jobs", <ClipboardList className="h-4.5 w-4.5" />, "My repair jobs", true)}
        {navItem("/repair-jobs/estimate", <FileText className="h-4.5 w-4.5" />, "Current estimate")}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={loggingOut}
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4.5 w-4.5" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}
