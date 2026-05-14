"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "rect" | "circle" | "text";
  className?: string;
}

export const Skeleton = ({
  width,
  height,
  variant = "rect",
  className,
}: SkeletonProps) => {
  return (
    <div
      style={{ width, height }}
      className={cn(
        "bg-surface animate-pulse",
        variant === "rect" && "rounded-[16px]",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded-[8px]",
        className
      )}
    />
  );
};

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("p-5 rounded-[20px] bg-card border border-border space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="space-y-2 flex-grow">
          <Skeleton variant="text" height={14} width="60%" />
          <Skeleton variant="text" height={10} width="40%" />
        </div>
      </div>
      <Skeleton variant="rect" height={120} className="w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" height={12} width={80} />
        <Skeleton variant="text" height={24} width={100} className="rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" height={12} width={`${100 / cols}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} variant="rect" height={12} width={`${100 / cols}%`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Skeleton variant="text" height={40} width={300} />
          <Skeleton variant="text" height={16} width={200} />
        </div>
        <Skeleton variant="rect" height={48} width={160} />
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" height={24} width={200} />
            <Skeleton variant="text" height={16} width={100} />
          </div>
          <div className="bg-card rounded-[24px] border border-border p-2">
            <SkeletonTable />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton variant="text" height={24} width={150} />
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
