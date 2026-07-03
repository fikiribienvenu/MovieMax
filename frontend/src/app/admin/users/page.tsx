// src/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, User, Shield, Ban, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/admin/users?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.data.users);
    } catch {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token) fetchUsers(); }, [token, search]);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`${API}/admin/users/${id}/toggle-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch {}
  };

  const planColor: Record<string, string> = {
    none: "text-text-muted",
    basic: "text-blue-400",
    premium: "text-brand-gold",
    annual: "text-brand-red",
  };

  const statusColor: Record<string, string> = {
    active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    inactive: "text-text-muted bg-bg-elevated border-border",
    cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
    past_due: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Users</h1>
          <p className="text-text-muted text-sm mt-1">{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors"
        />
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Plan</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Sub Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-bg-elevated transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red text-xs font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full border",
                      user.role === "admin"
                        ? "text-brand-gold bg-brand-gold/10 border-brand-gold/20"
                        : "text-text-muted bg-bg-elevated border-border"
                    )}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-sm font-bold capitalize", planColor[user.subscription?.plan ?? "none"])}>
                      {user.subscription?.plan ?? "none"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full border capitalize",
                      statusColor[user.subscription?.status ?? "inactive"] ?? statusColor.inactive
                    )}>
                      {user.subscription?.status ?? "inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                        user.isActive
                          ? "text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                          : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                      )}
                    >
                      {user.isActive ? <><Ban className="w-3 h-3" />Disable</> : <><CheckCircle className="w-3 h-3" />Enable</>}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}