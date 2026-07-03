// src/components/admin/MovieFormModal.tsx
"use client";

import { useState } from "react";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface MovieFormModalProps {
  movie: any | null;
  onClose: () => void;
  onSaved: () => void;
  token: string;
}

const CATEGORIES = ["Action", "Drama", "Sci-Fi", "Thriller", "Comedy", "Horror", "Romance", "Animation", "Documentary", "Crime"];
const QUALITY = ["480p", "720p", "1080p", "4K"];
const AGE_RATINGS = ["G", "PG", "PG-13", "R", "NC-17", "NR"];

export default function MovieFormModal({ movie, onClose, onSaved, token }: MovieFormModalProps) {
  const isEdit = !!movie;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: movie?.title ?? "",
    description: movie?.description ?? "",
    tagline: movie?.tagline ?? "",
    category: movie?.category ?? "Action",
    director: movie?.director ?? "",
    year: movie?.year ?? new Date().getFullYear(),
    duration: movie?.duration ?? 90,
    language: movie?.language ?? "English",
    country: movie?.country ?? "USA",
    ageRating: movie?.ageRating ?? "PG-13",
    badge: movie?.badge ?? "",
    isFeatured: movie?.isFeatured ?? false,
    isTrending: movie?.isTrending ?? false,
    isSubscriptionRequired: movie?.isSubscriptionRequired ?? true,
    posterUrl: movie?.poster?.url ?? "",
    backdropUrl: movie?.backdrop?.url ?? "",
    trailerYoutubeId: movie?.trailer?.youtubeId ?? "",
    videoUrl: movie?.video?.url ?? "",
    videoQuality: movie?.video?.quality ?? "1080p",
    cast: movie?.cast?.map((c: any) => c.name).join(", ") ?? "",
    tags: movie?.tags?.join(", ") ?? "",
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      title: form.title,
      description: form.description,
      tagline: form.tagline,
      category: form.category,
      director: form.director,
      year: Number(form.year),
      duration: Number(form.duration),
      language: form.language,
      country: form.country,
      ageRating: form.ageRating,
      badge: form.badge || null,
      isFeatured: form.isFeatured,
      isTrending: form.isTrending,
      isSubscriptionRequired: form.isSubscriptionRequired,
      poster: { url: form.posterUrl },
      backdrop: { url: form.backdropUrl },
      trailer: { youtubeId: form.trailerYoutubeId },
      video: { url: form.videoUrl, quality: form.videoQuality },
      cast: form.cast.split(",").map((n: string) => ({ name: n.trim() })).filter((c: any) => c.name),
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
    };

    try {
      const url = isEdit ? `${API}/admin/movies/${movie._id}` : `${API}/admin/movies`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save movie");
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-bg-tertiary border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors";
  const labelClass = "block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-bold text-text-primary">{isEdit ? "Edit Movie" : "Add New Movie"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title *</label>
              <input type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Movie title" className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Movie description..." rows={3} className={inputClass + " resize-none"} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Tagline</label>
              <input type="text" value={form.tagline} onChange={e => set("tagline", e.target.value)} placeholder="Short catchy tagline" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Director *</label>
              <input type="text" value={form.director} onChange={e => set("director", e.target.value)} placeholder="Director name" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Year *</label>
              <input type="number" value={form.year} onChange={e => set("year", e.target.value)} min={1900} max={2030} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Duration (minutes) *</label>
              <input type="number" value={form.duration} onChange={e => set("duration", e.target.value)} min={1} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Language</label>
              <input type="text" value={form.language} onChange={e => set("language", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Age Rating</label>
              <select value={form.ageRating} onChange={e => set("ageRating", e.target.value)} className={inputClass}>
                {AGE_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Media</h3>
            <div>
              <label className={labelClass}>Poster URL *</label>
              <input type="url" value={form.posterUrl} onChange={e => set("posterUrl", e.target.value)} placeholder="https://..." className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Backdrop URL *</label>
              <input type="url" value={form.backdropUrl} onChange={e => set("backdropUrl", e.target.value)} placeholder="https://..." className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>YouTube Trailer ID</label>
              <input type="text" value={form.trailerYoutubeId} onChange={e => set("trailerYoutubeId", e.target.value)} placeholder="e.g. Way9Dexny3w" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Video URL</label>
                <input type="url" value={form.videoUrl} onChange={e => set("videoUrl", e.target.value)} placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quality</label>
                <select value={form.videoQuality} onChange={e => set("videoQuality", e.target.value)} className={inputClass}>
                  {QUALITY.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Cast & Tags */}
          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Details</h3>
            <div>
              <label className={labelClass}>Cast (comma separated)</label>
              <input type="text" value={form.cast} onChange={e => set("cast", e.target.value)} placeholder="Actor 1, Actor 2, Actor 3" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="action, thriller, 2024" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <select value={form.badge} onChange={e => set("badge", e.target.value)} className={inputClass}>
                <option value="">None</option>
                <option value="new">New</option>
                <option value="hot">Hot</option>
                <option value="exclusive">Exclusive</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Settings</h3>
            {[
              { key: "isFeatured", label: "Featured on homepage" },
              { key: "isTrending", label: "Show as trending" },
              { key: "isSubscriptionRequired", label: "Requires subscription" },
            ].map((toggle) => (
              <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => set(toggle.key, !form[toggle.key as keyof typeof form])}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    form[toggle.key as keyof typeof form] ? "bg-brand-red" : "bg-bg-elevated border border-border"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    form[toggle.key as keyof typeof form] ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </div>
                <span className="text-sm text-text-secondary">{toggle.label}</span>
              </label>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-bg-elevated border border-border text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-brand-red text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Saving..." : "Adding..."}</> : isEdit ? "Save Changes" : "Add Movie"}
          </button>
        </div>
      </div>
    </div>
  );
}