// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Film, CreditCard, TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Stats {
  totalUsers: number;
  totalMovies: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  totalRevenue: number;
  newUsersToday: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSubscriptions, setRecentSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, subsRes] = await Promise.all([
          fetch(`${API}/admin/stats`, { headers }),
          fetch(`${API}/admin/subscriptions?status=pending&limit=5`, { headers }),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data.stats);
        }
        if (subsRes.ok) {
          const data = await subsRes.json();
          setRecentSubscriptions(data.data.subscriptions.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Movies", value: stats?.totalMovies ?? 0, icon: Film, color: "text-brand-gold", bg: "bg-brand-gold/10 border-brand-gold/20" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Payments", value: stats?.pendingSubscriptions ?? 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Total Revenue", value: `RWF ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-brand-red", bg: "bg-brand-red/10 border-brand-red/20" },
    { label: "New Users Today", value: stats?.newUsersToday ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  const planColor: Record<string, string> = {
    basic: "text-text-secondary",
    premium: "text-brand-gold",
    annual: "text-brand-red",
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>
              {isLoading ? "—" : card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pending Subscriptions */}
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-text-primary">Pending Payments</h2>
          <a href="/admin/subscriptions" className="text-xs text-brand-gold hover:underline">View all →</a>
        </div>
        {isLoading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : recentSubscriptions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-text-muted text-sm">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSubscriptions.map((sub) => (
              <div key={sub._id} className="flex items-center justify-between p-3 bg-bg-elevated border border-border rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{sub.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-text-muted">{sub.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold capitalize ${planColor[sub.plan] ?? "text-text-primary"}`}>{sub.plan}</p>
                  <p className="text-xs text-text-muted">RWF {sub.price?.amount?.toLocaleString()}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <a href="/admin/subscriptions" className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    Review
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}