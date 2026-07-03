// src/hooks/useAuth.ts
"use client";

import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const store = useAuthStore();
  return {
    isLoggedIn: store.isLoggedIn,
    isSubscribed: store.isSubscribed,
    plan: store.plan,
    user: store.user,
    watchlist: store.watchlist,
    login: store.login,
    logout: store.logout,
    signup: store.signup,
    subscribe: store.subscribe,
    addToWatchlist: store.addToWatchlist,
    removeFromWatchlist: store.removeFromWatchlist,
    isInWatchlist: store.isInWatchlist,
  };
};
