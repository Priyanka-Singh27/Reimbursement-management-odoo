"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FraudWarningBannerProps {
  score: number;
  reason: string;
  onDismiss: () => void;
  isVisible: boolean;
}

export function FraudWarningBanner({ score, reason, onDismiss, isVisible }: FraudWarningBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="bg-[#FEF3C7] border-l-[3px] border-[#D97706] rounded-[8px] p-4 flex items-start gap-3 shadow-sm my-4"
        >
          <AlertTriangle size={20} className="text-[#D97706] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-[17px] font-semibold text-[#92400e]">
              {score >= 85 ? "Similar expense detected. Cannot submit." : "We noticed a possible duplicate."}
            </h4>
            <p className="text-[17px] text-[#B45309] mt-1">{reason}</p>
            {score < 85 && (
              <p className="text-[17px] text-[#B45309] font-medium mt-1">Continue if this is a new expense.</p>
            )}
          </div>
          <button 
            type="button"
            onClick={onDismiss}
            className="text-[#D97706] hover:bg-[#FDE68A] p-1.5 rounded transition-colors shrink-0"
            aria-label="Dismiss warning"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
