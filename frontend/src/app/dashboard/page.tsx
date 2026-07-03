// src/app/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Crown, Film, Clock, List, Settings, LogOut,
  Play, Edit, Shield, Bell, CreditCard
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { movies } from "@/lib/data";
import { getInitials, getPlanLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isSubscribed, plan, watchlist, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const watchlistMovies = movies.filter((m) => watchlist.includes(m.id));

  const stats = [
    { label: "Plan", value: isSubscribed ? getPlanLabel(plan) : "Free", sub: isSubscribed ? "Active" : "Upgrade to watch", icon: <Crown className="w-4 h-4 text-brand-gold" />, color: "text-brand-gold" },
    { label: "Watchlist", value: watchlist.length.toString(), sub: "Movies saved", icon: <List className="w-4 h-4 text-brand-red" />, color: "text-text-primary" },
    { label: "Hours Watched", value: "127", sub: "This month", icon: <Clock className="w-4 h-4 text-text-muted" />, color: "text-text-primary" },
    { label: "Movies Available", value: isSubscribed ? "500+" : "0", sub: isSubscribed ? "Full access" : "Subscribe to unlock", icon: <Film className="w-4 h-4 text-text-muted" />, color: "text-text-primary" },
  ];

  const menuItems = [
    { icon: <Edit className="w-4 h-4" />, label: "Edit Profile", action: () => {} },
    { icon: <Shield className="w-4 h-4" />, label: "Change Password", action: () => {} },
    { icon: <CreditCard className="w-4 h-4" />, label: "Manage Plan", action: () => router.push("/pricing") },
    { icon: <Bell className="w-4 h-4" />, label: "Notifications", action: () => {} },
    { icon: <Settings className="w-4 h-4" />, label: "Settings", action: () => {} },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-bg-secondary border border-border rounded-2xl p-6 md:p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
          >
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center text-2xl font-bold border-[3px] border-brand-gold flex-shrink-0">
              {getInitials(user?.name || "User")}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl tracking-wider">{user?.name}</h1>
              <p className="text-text-muted text-sm mt-0.5">{user?.email}</p>
              {isSubscribed ? (
                <div className="inline-flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-bold px-3 py-1 rounded-full mt-2">
                  <Crown className="w-3 h-3" />
                  {getPlanLabel(plan)} Member
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-bg-elevated border border-border text-text-muted text-xs font-medium px-3 py-1 rounded-full mt-2">
                  Free Account
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {!isSubscribed && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-gold text-black rounded-xl text-sm font-bold hover:bg-brand-gold-dark transition-all"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade Plan
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-tertiary border border-border text-text-secondary rounded-xl text-sm font-medium hover:text-brand-red hover:border-brand-red/40 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-bg-secondary border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{stat.label}</p>
                  {stat.icon}
                </div>
                <p className={`font-display text-3xl tracking-wider ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-text-muted mt-1">{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Watchlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl tracking-wider uppercase">My Watchlist</h2>
                <Link href="/search" className="text-sm text-text-muted hover:text-brand-gold transition-colors">
                  Browse more →
                </Link>
              </div>

              {watchlistMovies.length === 0 ? (
                <div className="bg-bg-secondary border border-border rounded-2xl p-10 text-center">
                  <Film className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <h3 className="font-semibold text-text-secondary mb-1.5">Your watchlist is empty</h3>
                  <p className="text-text-muted text-sm mb-5">Start adding movies you want to watch.</p>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-all"
                  >
                    Browse Movies
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {watchlistMovies.map((movie, i) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/movies/${movie.id}`} className="group block bg-bg-card border border-border rounded-xl overflow-hidden hover:border-brand-gold/30 transition-all hover:-translate-y-1">
                        <div className="relative aspect-[2/3]">
                          <Image
                            src={movie.poster}
                            alt={movie.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 fill-white transition-all" />
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold truncate text-text-primary">{movie.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{movie.year} · {movie.category}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Sidebar: Account & Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Subscription Card */}
              <div className="bg-bg-secondary border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-4 text-text-secondary uppercase tracking-wider text-xs">Subscription</h3>
                {isSubscribed ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-5 h-5 text-brand-gold" />
                      <span className="font-bold text-brand-gold">{getPlanLabel(plan)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-text-muted mb-4">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className="text-emerald-400 font-medium">● Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next billing</span>
                        <span className="text-text-secondary">May 12, 2026</span>
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="block w-full text-center py-2.5 bg-bg-elevated border border-border rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:border-text-muted transition-all"
                    >
                      Manage Plan
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-text-muted text-sm mb-4">Subscribe to unlock full movie access.</p>
                    <Link
                      href="/pricing"
                      className="block w-full text-center py-2.5 bg-brand-gold text-black rounded-lg text-sm font-bold hover:bg-brand-gold-dark transition-all"
                    >
                      ✦ Choose a Plan
                    </Link>
                  </div>
                )}
              </div>

              {/* Account Menu */}
              <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
                <h3 className="font-semibold text-xs text-text-muted uppercase tracking-wider px-5 pt-5 pb-3">Account</h3>
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all text-left border-t border-border/50 first:border-t-0"
                  >
                    <span className="text-text-muted">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all border-t border-border/50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
