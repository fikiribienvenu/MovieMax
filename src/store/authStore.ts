// src/store/authStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, PlanType } from "@/types";

interface AuthStore {
  isLoggedIn: boolean;
  isSubscribed: boolean;
  plan: PlanType | null;
  user: User | null;
  watchlist: number[];

  login: (user: User) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
  subscribe: (plan: PlanType) => void;
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      isSubscribed: false,
      plan: null,
      user: null,
      watchlist: [],

      login: (user: User) =>
        set({
          isLoggedIn: true,
          user,
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          isSubscribed: false,
          plan: null,
          user: null,
          watchlist: [],
        }),

      signup: (name: string, email: string) => {
        const user: User = {
          id: Math.random().toString(36).slice(2),
          name,
          email,
          createdAt: new Date().toISOString(),
        };
        set({ isLoggedIn: true, user });
      },

      subscribe: (plan: PlanType) =>
        set({
          isSubscribed: true,
          plan,
        }),

      addToWatchlist: (movieId: number) =>
        set((state) => ({
          watchlist: state.watchlist.includes(movieId)
            ? state.watchlist
            : [...state.watchlist, movieId],
        })),

      removeFromWatchlist: (movieId: number) =>
        set((state) => ({
          watchlist: state.watchlist.filter((id) => id !== movieId),
        })),

      isInWatchlist: (movieId: number) => get().watchlist.includes(movieId),
    }),
    {
      name: "IWACUFLIX-auth",
    }
  )
);
