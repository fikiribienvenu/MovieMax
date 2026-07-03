// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getPlanLabel(plan: string | null): string {
  const labels: Record<string, string> = {
    basic: "Basic",
    premium: "Premium",
    annual: "Annual Premium",
  };
  return plan ? labels[plan] || plan : "Free";
}
