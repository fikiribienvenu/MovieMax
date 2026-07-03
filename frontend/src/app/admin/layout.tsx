// src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Film, Users, CreditCard,
  Settings, LogOut, ChevronRight, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/movies", icon: Film, label: "Movies" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/auth/login");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/">
            <span className="font-display text-2xl tracking-widest text-brand-red">
              REBA<span className="text-brand-gold">FLIX</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield className="w-3 h-3 text-brand-gold" />
            <span className="text-xs text-brand-gold font-bold tracking-wider uppercase">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-red/10 text-brand-red border border-brand-red/20"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center text-brand-red text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}