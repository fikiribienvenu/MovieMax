// src/components/ui/Toast.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-brand-red" />,
  info: <Info className="w-4 h-4 text-brand-gold" />,
};

export function Toast({ message, type = "success", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 bg-bg-secondary border border-border rounded-xl px-4 py-3 shadow-2xl max-w-sm"
    >
      {icons[type]}
      <p className="text-sm text-text-primary flex-1">{message}</p>
      <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors ml-2">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Toast container to use at root level
let toastQueue: ((msg: string, type?: ToastType) => void) | null = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  useEffect(() => {
    toastQueue = (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
    };
    return () => { toastQueue = null; };
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export const showToast = (message: string, type: ToastType = "success") => {
  if (toastQueue) toastQueue(message, type);
};
