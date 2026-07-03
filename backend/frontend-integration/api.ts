// frontend-integration/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Drop this file into your Next.js frontend at: src/lib/api.ts
// It provides typed fetch wrappers for all CineMax backend endpoints.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Shared fetch helper ──────────────────────────────────────────────────────
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",                          // send JWT cookie automatically
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `API error ${res.status}`);
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (body: { name: string; email: string; password: string; confirmPassword: string }) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () =>
    apiFetch("/auth/logout", { method: "POST" }),

  me: () =>
    apiFetch("/auth/me"),

  forgotPassword: (email: string) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    apiFetch(`/auth/reset-password/${token}`, { method: "PATCH", body: JSON.stringify({ password, confirmPassword }) }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiFetch("/auth/update-password", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) }),
};

// ─── Movies ───────────────────────────────────────────────────────────────────
export const moviesApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch(`/movies${qs}`);
  },
  getFeatured: () => apiFetch("/movies/featured"),
  getTrending: (limit = 10) => apiFetch(`/movies/trending?limit=${limit}`),
  getTopRated: (limit = 10) => apiFetch(`/movies/top-rated?limit=${limit}`),
  getLatest:   (limit = 10) => apiFetch(`/movies/latest?limit=${limit}`),
  search: (q: string, category?: string) =>
    apiFetch(`/movies/search?q=${encodeURIComponent(q)}${category ? "&category=" + category : ""}`),
  getById: (id: string) => apiFetch(`/movies/${id}`),
  getStreamUrl: (id: string) => apiFetch(`/movies/${id}/stream`),
  toggleLike: (id: string) => apiFetch(`/movies/${id}/like`, { method: "POST" }),
};

// ─── User / Profile ───────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => apiFetch("/users/me"),
  updateProfile: (body: { name?: string; avatar?: string }) =>
    apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(body) }),

  // Watchlist
  getWatchlist: () => apiFetch("/users/me/watchlist"),
  addToWatchlist: (movieId: string) =>
    apiFetch(`/users/me/watchlist/${movieId}`, { method: "POST" }),
  removeFromWatchlist: (movieId: string) =>
    apiFetch(`/users/me/watchlist/${movieId}`, { method: "DELETE" }),

  // Watch History
  getHistory: () => apiFetch("/users/me/history"),
  saveProgress: (movieId: string, progress: number) =>
    apiFetch(`/users/me/history/${movieId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ progress }),
    }),
  clearHistory: () => apiFetch("/users/me/history", { method: "DELETE" }),
};

// ─── Subscriptions (AfriPay) ──────────────────────────────────────────────────
export const subscriptionApi = {
  /**
   * Get all available plans with RWF pricing
   */
  getPlans: () => apiFetch("/subscriptions/plans"),

  /**
   * STEP 1 — Initiate payment:
   * Returns an AfriPay checkout form + clientToken.
   * Use the returned `checkoutForm` HTML or `afripay.fields` to build your form.
   */
  initiatePayment: (plan: "basic" | "premium" | "annual") =>
    apiFetch("/subscriptions/initiate", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  /**
   * STEP 2 — Poll payment status after returning from AfriPay:
   * Call this on the /payment/callback page with the clientToken from the URL.
   */
  checkStatus: (clientToken: string) =>
    apiFetch(`/subscriptions/status/${clientToken}`),

  /**
   * Get current user's subscription details
   */
  getMy: () => apiFetch("/subscriptions/my"),

  /**
   * Billing history
   */
  getBillingHistory: () => apiFetch("/subscriptions/billing"),

  /**
   * Cancel subscription (retains access until period end)
   */
  cancel: () => apiFetch("/subscriptions/cancel", { method: "PATCH" }),

  /**
   * Reactivate a recently cancelled subscription
   */
  reactivate: () => apiFetch("/subscriptions/reactivate", { method: "PATCH" }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getForMovie: (movieId: string, page = 1) =>
    apiFetch(`/movies/${movieId}/reviews?page=${page}`),

  getMyReview: (movieId: string) =>
    apiFetch(`/movies/${movieId}/reviews/mine`),

  create: (movieId: string, body: { rating: number; title?: string; body: string; containsSpoilers?: boolean }) =>
    apiFetch(`/movies/${movieId}/reviews`, { method: "POST", body: JSON.stringify(body) }),

  update: (reviewId: string, body: Partial<{ rating: number; title: string; body: string }>) =>
    apiFetch(`/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify(body) }),

  delete: (reviewId: string) =>
    apiFetch(`/reviews/${reviewId}`, { method: "DELETE" }),

  vote: (reviewId: string, vote: "helpful" | "not_helpful") =>
    apiFetch(`/reviews/${reviewId}/vote`, { method: "POST", body: JSON.stringify({ vote }) }),
};
