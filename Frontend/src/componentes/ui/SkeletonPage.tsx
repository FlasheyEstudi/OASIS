"use client";

import React from "react";
import SkeletonCard from "./SkeletonCard";
import { cn } from "@/lib/utils";

interface SkeletonPageProps {
  type: "dashboard" | "list" | "detail" | "form" | "grid";
}

const SkeletonPage = ({ type }: SkeletonPageProps) => {
  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-surface/40 rounded-[12px] animate-pulse-slow" />
          <div className="h-4 w-48 bg-surface/40 rounded-[8px] animate-pulse-slow" />
        </div>
        <div className="h-12 w-40 bg-surface/40 rounded-[16px] animate-pulse-slow" />
      </div>

      {(type === "dashboard" || type === "grid") && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="bg-card rounded-[24px] border border-border p-8 space-y-6">
            <div className="h-6 w-48 bg-surface/40 rounded-[8px] animate-pulse-slow mb-8" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-6 items-center">
                <div className="w-10 h-10 rounded-full bg-surface/40 animate-pulse-slow" />
                <div className="flex-grow h-4 bg-surface/40 rounded-[6px] animate-pulse-slow" />
                <div className="w-32 h-4 bg-surface/40 rounded-[6px] animate-pulse-slow" />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "list" && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 bg-card border border-border rounded-[20px] flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-grow">
                <div className="w-12 h-12 rounded-2xl bg-surface/40 animate-pulse-slow" />
                <div className="space-y-2 flex-grow">
                  <div className="h-4 w-1/3 bg-surface/40 rounded-[8px] animate-pulse-slow" />
                  <div className="h-3 w-1/4 bg-surface/40 rounded-[6px] animate-pulse-slow" />
                </div>
              </div>
              <div className="w-24 h-8 bg-surface/40 rounded-full animate-pulse-slow" />
            </div>
          ))}
        </div>
      )}

      {type === "detail" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-[400px] w-full bg-surface/40 rounded-[24px] animate-pulse-slow" />
            <div className="space-y-4">
              <div className="h-6 w-1/4 bg-surface/40 rounded-[8px] animate-pulse-slow" />
              <div className="h-32 w-full bg-surface/40 rounded-[16px] animate-pulse-slow" />
            </div>
          </div>
          <div className="space-y-6">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={2} />
          </div>
        </div>
      )}

      {type === "form" && (
        <div className="max-w-2xl mx-auto space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-32 bg-surface/40 rounded-[6px] animate-pulse-slow" />
              <div className="h-14 w-full bg-surface/40 rounded-[16px] animate-pulse-slow" />
            </div>
          ))}
          <div className="h-14 w-full bg-accent/20 rounded-[18px] animate-pulse-slow mt-12" />
        </div>
      )}
    </div>
  );
};

export default SkeletonPage;
