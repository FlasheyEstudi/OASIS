"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FrostPanelProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy";
}

export const FrostPanel = ({
  children,
  className = "",
  intensity = "medium",
}: FrostPanelProps) => {
  return (
    <div
      className={cn(
        "rounded-card shadow-card relative overflow-hidden",
        {
          "frost": intensity === "light" || intensity === "medium",
          "frost-heavy": intensity === "heavy",
        },
        className
      )}
    >
      {/* Inner top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
