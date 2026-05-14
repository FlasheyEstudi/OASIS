"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-between gap-4 py-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex flex-col gap-0.5 select-none cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
        <span className="font-body text-fluid-sm font-medium text-text">
          {label}
        </span>
        {description && (
          <span className="font-body text-fluid-xs text-muted leading-relaxed">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          checked ? "bg-accent" : "bg-subtle/30"
        )}
      >
        <motion.span
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-card ring-0"
          )}
        />
      </button>
    </div>
  );
};

export default Toggle;
