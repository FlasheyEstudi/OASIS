"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "frost" | "ghost";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({
  children,
  className,
  variant = "default",
  padding = "md",
  hover = true,
  onClick,
}: CardProps) => {
  const variants = {
    default: "bg-card border border-border shadow-card",
    frost: "frost shadow-card",
    ghost: "bg-transparent border border-border",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[20px] transition-all duration-350 ease-apple relative overflow-hidden",
        variants[variant],
        paddings[padding],
        onClick && "cursor-pointer",
        hover && variant !== "ghost" && "hover:-translate-y-[3px] hover:shadow-float hover:border-border-hover",
        className
      )}
    >
      {/* Inner top glow - Efecto pulido Apple */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
