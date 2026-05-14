"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: LucideIcon;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconLeft,
  iconRight: IconRight,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) => {
  const Icon = icon || iconLeft;
  const variants = {
    primary: "bg-accent text-white shadow-glow hover:bg-accent-light hover:-translate-y-[1px] hover:shadow-float active:translate-y-0",
    secondary: "bg-surface border border-border text-text hover:bg-elevated hover:border-border-hover active:bg-card",
    ghost: "bg-transparent text-muted hover:text-text hover:bg-surface/50",
    danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
    glass: "frost text-text hover:bg-surface/30 hover:border-border-hover",
  };

  const sizes = {
    sm: "h-8 px-3.5 text-fluid-xs rounded-[12px]",
    md: "h-10 px-5 text-fluid-sm rounded-[14px]",
    lg: "h-12 px-6 text-fluid-base rounded-[16px]",
    xl: "h-14 px-8 text-fluid-lg rounded-[18px]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center gap-2 font-semibold transition-all duration-350 ease-apple",
        fullWidth ? "w-full" : "w-fit",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed grayscale-[0.5]",
        className
      )}
      {...(props as any)}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {size !== "sm" && <span>Cargando...</span>}
        </div>
      ) : (
        <>
          {Icon && <Icon size={size === "sm" ? 16 : 20} />}
          {children}
          {IconRight && <IconRight size={size === "sm" ? 16 : 20} />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
