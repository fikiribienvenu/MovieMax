// src/components/movies/CategoryFilter.tsx
"use client";

import { motion } from "framer-motion";
import { Category } from "@/types";

const categories: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Action", value: "Action" },
  { label: "Drama", value: "Drama" },
  { label: "Sci-Fi", value: "Sci-Fi" },
  { label: "Thriller", value: "Thriller" },
  { label: "Comedy", value: "Comedy" },
  { label: "Horror", value: "Horror" },
  { label: "Romance", value: "Romance" },
  { label: "Animation", value: "Animation" },
];

interface CategoryFilterProps {
  active: Category | "all";
  onChange: (cat: Category | "all") => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {categories.map((cat) => {
        const isActive = active === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className="relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="active-category"
                className="absolute inset-0 bg-brand-red rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-200 ${
                isActive
                  ? "text-white font-semibold"
                  : "text-text-muted border border-border rounded-full px-0 py-0 hover:text-text-primary"
              }`}
            >
              {cat.label}
            </span>
            {!isActive && (
              <span className="absolute inset-0 rounded-full border border-border hover:border-text-muted transition-colors" />
            )}
          </button>
        );
      })}
    </div>
  );
}
