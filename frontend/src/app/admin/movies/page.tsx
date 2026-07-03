// src/app/admin/movies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Film, Eye, Star, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import MovieFormModal from "@/components/admin/MovieFormModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function AdminMoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMovie, setEditMovie] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/admin/movies?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMovies(data.data.movies);
    } catch (err) {
      setError("Failed to load movies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token) fetchMovies(); }, [token, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res = await fetch(`${API}/admin/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchMovies();
    } catch (err) {
      setError("Failed to delete movie");
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await fetch(`${API}/admin/movies/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      });
      fetchMovies();
    } catch (err) {}
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Movies</h1>
          <p className="text-text-muted text-sm mt-1">{movies.length} movies total</p>
        </div>
        <button
          onClick={() => { setEditMovie(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-brand-red-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Movies Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-muted">No movies found. Add your first movie!</p>
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Movie</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Year</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Rating</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movies.map((movie, i) => (
                <motion.tr
                  key={movie._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-bg-elevated transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0">
                        {movie.poster?.url ? (
                          <img src={movie.poster.url} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-4 h-4 text-text-muted" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-text-primary">{movie.title}</p>
                        <p className="text-xs text-text-muted">{movie.director}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-secondary">
                      {movie.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{movie.year}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                      <span className="text-sm font-bold text-brand-gold">{movie.rating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      {movie.isFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold w-fit">
                          FEATURED
                        </span>
                      )}
                      {movie.isTrending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red w-fit">
                          TRENDING
                        </span>
                      )}
                      {!movie.isFeatured && !movie.isTrending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-text-muted w-fit">
                          NORMAL
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditMovie(movie); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(movie._id, movie.isFeatured)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          movie.isFeatured
                            ? "text-brand-gold bg-brand-gold/10"
                            : "text-text-muted hover:text-brand-gold hover:bg-brand-gold/10"
                        )}
                        title="Toggle Featured"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Movie Form Modal */}
      {showModal && (
        <MovieFormModal
          movie={editMovie}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchMovies(); }}
          token={token!}
        />
      )}
    </div>
  );
}