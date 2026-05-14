"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength = ({ password = "" }: PasswordStrengthProps) => {
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    // Normalize to 0-4
    return Math.min(Math.floor((score / 5) * 4), 4);
  };

  const strength = calculateStrength(password);

  const getLabel = () => {
    if (!password) return "";
    if (strength <= 1) return "Débil";
    if (strength === 2) return "Media";
    if (strength === 3) return "Buena";
    return "Fuerte";
  };

  const getColor = (index: number) => {
    if (index >= strength) return "bg-subtle/20";
    if (strength <= 1) return "bg-danger";
    if (strength === 2) return "bg-warning";
    if (strength === 3) return "bg-info";
    return "bg-success";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-1.5 h-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              getColor(i)
            )}
          />
        ))}
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
          Fortaleza
        </span>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest transition-colors duration-500",
          strength <= 1 ? "text-danger" : strength === 2 ? "text-warning" : strength === 3 ? "text-info" : "text-success"
        )}>
          {getLabel()}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrength;
