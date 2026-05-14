"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  hasAvatar?: boolean;
  lines?: number;
  hasImage?: boolean;
  className?: string;
}

const SkeletonCard = ({
  hasAvatar = false,
  lines = 3,
  hasImage = false,
  className,
}: SkeletonCardProps) => {
  return (
    <div className={cn("p-5 rounded-[20px] bg-card border border-border space-y-5 overflow-hidden", className)}>
      <div className="flex items-center gap-4">
        {hasAvatar && (
          <div className="w-12 h-12 rounded-full bg-surface/40 animate-pulse-slow" />
        )}
        <div className="space-y-2 flex-grow">
          <div className="h-4 w-3/4 bg-surface/40 rounded-[8px] animate-pulse-slow" />
          <div className="h-3 w-1/2 bg-surface/40 rounded-[6px] animate-pulse-slow" />
        </div>
      </div>

      {hasImage && (
        <div className="aspect-video w-full bg-surface/40 rounded-[16px] animate-pulse-slow" />
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{ width: i === lines - 1 ? "60%" : i === 0 ? "100%" : "85%" }}
            className="h-3 bg-surface/40 rounded-[6px] animate-pulse-slow"
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
