// src/app/admin/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, RefreshCw, User, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function AdminSubscriptionsPage() {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/admin/subscriptions?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSubscriptions(data.data.subscriptions);
    } catch { setError("Failed to load"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { if (token) fetchSubscriptions(); }, [token, filter]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await fetch(`${API}/admin/subscriptions/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch {}
    finally { setActionLoading(null); }
  };

  const statusColor: Record<string, string> = {
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    failed: "text-red-400 bg-red-500/10 border-red-500/20",
    cancelled: "text-text-muted bg-bg-elevated border-border",
  };

  const planColor: Record<string, string> = {
    basic: "text-text-secondary", premium: "text-brand-gold", annual: "text-brand-red",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Subscriptions</h1>
          <p className="text-text-muted text-sm mt-1">Review and confirm user payments</p>
        </div>
        <button onClick={fetchSubscriptions} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {(["pending", "active", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
              filter === f ? "bg-brand-gold text-black" : "bg-bg-card border border-border text-text-muted hover:text-text-primary"
            )}>
            {f}
          </button>
        ))}
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 text-brand-gold animate-spin" /></div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No {filter === "all" ? "" : filter} subscriptions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub, i) => (
            <motion.div key={sub._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-text-primary">{sub.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-text-muted">{sub.user?.email ?? "—"}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className={cn("font-bold text-sm capitalize", planColor[sub.plan])}>{sub.plan} Plan</p>
                <p className="text-xs text-text-muted">RWF {sub.price?.amount?.toLocaleString()}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="font-mono truncate max-w-[120px]">{sub.afripay?.transactionId ?? "No TXN"}</span>
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">{new Date(sub.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={cn("text-xs font-bold px-3 py-1 rounded-full border capitalize", statusColor[sub.status] ?? statusColor.cancelled)}>
                {sub.status}
              </span>
              {sub.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(sub._id, "approve")} disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors disabled:opacity-50">
                    <CheckCircle className="w-3.5 h-3.5" />{actionLoading === sub._id + "approve" ? "..." : "Approve"}
                  </button>
                  <button onClick={() => handleAction(sub._id, "reject")} disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors disabled:opacity-50">
                    <XCircle className="w-3.5 h-3.5" />{actionLoading === sub._id + "reject" ? "..." : "Reject"}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}