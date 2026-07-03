// src/types/index.ts

export interface Movie {
  id: number;
  title: string;
  description: string;
  poster: string;
  backdropUrl: string;
  trailerUrl: string;
  videoUrl: string;
  category: Category;
  rating: number;
  year: number;
  duration: string;
  genre: string;
  director: string;
  cast: string[];
  trending: boolean;
  badge?: "new" | "free" | null;
}

export type Category =
  | "Action"
  | "Drama"
  | "Sci-Fi"
  | "Thriller"
  | "Comedy"
  | "Horror"
  | "Romance"
  | "Animation";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export type PlanType = "basic" | "premium" | "annual";

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  popular?: boolean;
  color: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  isSubscribed: boolean;
  plan: PlanType | null;
  user: User | null;
  watchlist: number[];
}

export interface SearchFilters {
  query: string;
  category: Category | "all";
  sortBy: "rating" | "year" | "title";
}
