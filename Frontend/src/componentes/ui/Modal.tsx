"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  closeOnOverlay = true,
}: ModalProps) => {
  // Manejar Escape para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-3xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlay ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full bg-surface border border-border shadow-float rounded-[24px] overflow-hidden",
              sizes[size]
            )}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-fluid-xl font-light text-text leading-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="font-body text-fluid-sm text-muted font-light">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-muted hover:text-text active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
            
            {/* Bottom spacer / Footer area placeholder */}
            <div className="h-8" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
