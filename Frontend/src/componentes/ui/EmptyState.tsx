"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import Button from "./Button";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center max-w-sm mx-auto", className)}>
      <Reveal direction="up" delay={0.1}>
        <div className="w-20 h-20 bg-surface rounded-[24px] flex items-center justify-center mb-6 shadow-inner-glow border border-white/5">
          <Icon size={40} className="text-subtle/30" />
        </div>
      </Reveal>

      <Reveal direction="up" delay={0.2}>
        <h3 className="font-display text-fluid-xl font-light text-text mb-3">
          {title}
        </h3>
      </Reveal>

      <Reveal direction="up" delay={0.3}>
        <p className="font-body text-fluid-sm text-muted mb-8 leading-relaxed">
          {description}
        </p>
      </Reveal>

      <Reveal direction="up" delay={0.4}>
        <div className="flex flex-col gap-3 w-full">
          {action && (
            <Button onClick={action.onClick} variant="primary" fullWidth size="lg">
              {action.label}
            </Button>
          )}
        </div>
      </Reveal>
    </div>
  );
};

export default EmptyState;
