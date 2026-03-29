"use client";

import React from "react";
import { useUiStore, ToastMessage } from "../../store/uiStore";
import { AnimatePresence, motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

// --- Empty States ---
interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={64} className="text-[#D0CBC3] mb-5" />
      <h3 className="text-[20px] font-medium text-gray-900 mb-1">{heading}</h3>
      <p className="text-[15px] text-[#666] max-w-sm mb-6">{subtext}</p>
      {action}
    </div>
  );
}

// --- Loading Skeletons ---
export function Skeleton({ className }: { className?: string }) {
  // Uses shimmer animation defined in standard CSS to replace content smoothly.
  return (
    <div
      className={`relative overflow-hidden bg-[#EDE9E3] ${className || ""}`}
      style={{
        backgroundImage: "linear-gradient(90deg, #EDE9E3 25%, #E5E1DA 50%, #EDE9E3 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite linear"
      }}
    />
  );
}

// --- Global Toasts Component ---
// Mount this once inside your layout wrapper
export function GlobalToasts() {
  const { toasts } = useUiStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast: ToastMessage) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-auto bg-[#141414] text-white px-5 py-3 rounded-[10px] shadow-2xl text-[15px] min-w-[300px]"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
