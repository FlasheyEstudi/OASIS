"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "success" | "warning" | "danger" | "info" | "muted" | "glass";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
}

const Badge = ({
  children,
  variant = "accent",
  size = "sm",
  dot = false,
  pulse = false,
  className,
  icon,
  iconLeft,
  iconRight: IconRight,
}: BadgeProps) => {
  const Icon = icon || iconLeft;
  
  const variants = {
    accent: "bg-accent/10 text-accent border border-accent/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    info: "bg-info/10 text-info border border-info/20",
    muted: "bg-muted/10 text-muted border border-muted/20",
    glass: "bg-white/5 backdrop-blur-md text-text border border-white/10",
  };

  const dotColors = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    muted: "bg-muted",
    glass: "bg-white",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[0.65rem] font-bold tracking-tight",
    sm: "px-2.5 py-0.5 text-fluid-xs font-semibold tracking-wide",
    md: "px-3 py-1 text-fluid-sm font-semibold tracking-wide",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full uppercase transition-all duration-300",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <div className="relative flex h-2 w-2">
          {pulse && (
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotColors[variant]
            )} />
          )}
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            dotColors[variant]
          )} />
        </div>
      )}
      {children}
    </span>
  );
};

export default Badge;
