"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  show: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, duration: 4000, ...options };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => remove(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
  const { id, type, title, message, duration, action } = toast;

  useEffect(() => {
    const timer = setTimeout(onRemove, duration);
    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  const icons = {
    success: <CheckCircle className="text-success" size={20} />,
    error: <XCircle className="text-danger" size={20} />,
    warning: <AlertTriangle className="text-warning" size={20} />,
    info: <Info className="text-info" size={20} />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className="pointer-events-auto w-full"
    >
      <div className="frost border-border-light shadow-float rounded-[16px] overflow-hidden">
        <div className="p-4 flex gap-4">
          <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
          <div className="flex-grow min-w-0">
            <h4 className="font-display text-fluid-sm font-semibold text-text mb-0.5">
              {title}
            </h4>
            <p className="font-body text-fluid-xs text-muted leading-relaxed">
              {message}
            </p>
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  onRemove();
                }}
                className="mt-2 text-fluid-xs font-bold text-accent hover:text-accent-light transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
          <button
            onClick={onRemove}
            className="flex-shrink-0 text-subtle hover:text-text transition-colors h-fit p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white/5 w-full relative">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: (duration || 4000) / 1000, ease: "linear" }}
            className={cn(
              "absolute inset-y-0 left-0",
              type === "success" && "bg-success",
              type === "error" && "bg-danger",
              type === "warning" && "bg-warning",
              type === "info" && "bg-info"
            )}
          />
        </div>
      </div>
    </motion.div>
  );
};
