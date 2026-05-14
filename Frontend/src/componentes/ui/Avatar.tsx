"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
}

const Avatar = ({
  src,
  name,
  size = "md",
  status,
  className,
}: AvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const sizes = {
    xs: "w-6 h-6 text-[0.65rem]",
    sm: "w-8 h-8 text-fluid-xs",
    md: "w-10 h-10 text-fluid-sm",
    lg: "w-14 h-14 text-fluid-base",
    xl: "w-20 h-20 text-fluid-lg",
  };

  const statusColors = {
    online: "bg-success",
    offline: "bg-subtle",
    busy: "bg-danger",
    away: "bg-warning",
  };

  const statusSizes = {
    xs: "w-2 h-2 border-[1px]",
    sm: "w-2.5 h-2.5 border-[1.5px]",
    md: "w-3 h-3 border-[2px]",
    lg: "w-4 h-4 border-[2px]",
    xl: "w-5 h-5 border-[3px]",
  };

  return (
    <div className={cn("relative shrink-0 select-none", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden border border-border bg-accent/5 transition-transform duration-300",
          sizes[size],
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-display font-medium text-accent">
            {getInitials(name)}
          </span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-bg",
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
