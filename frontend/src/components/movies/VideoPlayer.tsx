// src/components/movies/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  poster?: string;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (url.includes("youtube.com/embed/")) {
      return url.includes("autoplay") ? url : url + "?autoplay=1&rel=0";
    }
  } catch {}
  return null;
};

// Load HLS.js from CDN
const loadHlsScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).Hls) {
      resolve((window as any).Hls);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.16/dist/hls.min.js";
    script.onload = () => resolve((window as any).Hls);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function VideoPlayer({ isOpen, onClose, videoUrl, title, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<any>(null);
  const [playing, setPlaying]       = useState(false);
  const [muted, setMuted]           = useState(true);
  const [volume, setVolume]         = useState(0.8);
  const [progress, setProgress]     = useState(0);
  const [duration, setDuration]     = useState(0);
  const [ready, setReady]           = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);
  const isYouTube = !!youtubeEmbedUrl;
  const isHLSUrl  = videoUrl?.includes(".m3u8");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!isYouTube && e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isYouTube]);

  // Setup video when opened
  useEffect(() => {
    const v = videoRef.current;
    if (!v || isYouTube) return;

    if (isOpen && videoUrl) {
      setReady(false);
      setProgress(0);
      setPlaying(false);

      if (isHLSUrl) {
        // Load HLS.js from CDN then setup stream
        loadHlsScript().then((Hls) => {
          if (!Hls) return;
          if (Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();
            const hls = new Hls();
            hls.loadSource(videoUrl);
            hls.attachMedia(v);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setReady(true);
              v.muted = true;
              setMuted(true);
              v.play().catch(() => {});
            });
            hlsRef.current = hls;
          } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari
            v.src = videoUrl;
            v.load();
          }
        }).catch(() => {
          // CDN failed, try direct
          v.src = videoUrl;
          v.load();
        });
      } else {
        // Regular MP4
        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
        v.src = videoUrl;
        v.load();
      }
    }

    if (!isOpen) {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      v.pause();
      v.src = "";
      setPlaying(false);
      setProgress(0);
      setReady(false);
    }
  }, [isOpen, videoUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    setReady(true);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || !isFinite(v.duration)) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration || !isFinite(v.duration)) return;
    const val = parseFloat(e.target.value);
    v.currentTime = (val / 100) * v.duration;
    setProgress(val);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen?.();
  };

  const handleRestart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const currentTime = isFinite(duration) ? (progress / 100) * duration : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black"
          onMouseMove={!isYouTube ? resetControlsTimer : undefined}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent">
            <p className="text-white font-semibold text-sm truncate max-w-xs">{title}</p>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* YouTube */}
          {isYouTube ? (
            <iframe
              src={youtubeEmbedUrl!}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                poster={poster}
                muted
                playsInline
                className="w-full h-full object-contain"
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => { setPlaying(false); setShowControls(true); }}
                onCanPlay={() => !ready && setReady(true)}
              />

              {/* Click overlay */}
              <div
                className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                onClick={togglePlay}
              >
                <AnimatePresence>
                  {!playing && ready && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="w-20 h-20 rounded-full bg-black/60 border-2 border-white/40 flex items-center justify-center pointer-events-none"
                    >
                      <Play className="w-9 h-9 fill-white text-white ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!ready && (
                  <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin pointer-events-none" />
                )}
              </div>

              {/* Muted hint */}
              <AnimatePresence>
                {muted && playing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white text-xs px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 pointer-events-none"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    Playing muted — click 🔊 to unmute
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-5 pb-6 pt-12"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-white/60 text-xs tabular-nums w-10">{formatTime(currentTime)}</span>
                      <input
                        type="range" min={0} max={100} step={0.1}
                        value={progress} onChange={onSeek}
                        disabled={!ready}
                        className="flex-1 h-1 cursor-pointer rounded-full appearance-none disabled:opacity-40"
                        style={{
                          accentColor: "#facc15",
                          background: `linear-gradient(to right, #facc15 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                        }}
                      />
                      <span className="text-white/60 text-xs tabular-nums w-10 text-right">{formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors">
                        {playing ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                      </button>
                      <button onClick={handleRestart} className="text-white/60 hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                          {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range" min={0} max={1} step={0.05}
                          value={muted ? 0 : volume} onChange={onVolumeChange}
                          className="w-20 h-1 cursor-pointer"
                          style={{ accentColor: "#facc15" }}
                        />
                      </div>
                      <div className="flex-1" />
                      <button onClick={handleFullscreen} className="text-white/60 hover:text-white transition-colors">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}