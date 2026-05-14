"use client";

import React, { useState } from "react";
import { LucideIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  label: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
  size?: "default" | "large" | "small" | "xl";
}

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightElement,
  error,
  hint,
  disabled,
  required,
  size = "default",
  className,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {/* Label estilo Apple */}
      <label className="text-fluid-sm text-muted font-medium px-1">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative group">
        {/* Icono Izquierdo */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors duration-200">
            <Icon size={size === "large" ? 22 : 18} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full bg-surface border border-border text-text transition-all duration-200",
            "placeholder:text-subtle/50 outline-none",
            "rounded-[16px]", // Bordes Apple-style
            size === "large" ? "py-4 px-5 text-fluid-base" : size === "small" ? "py-2.5 px-3 text-fluid-xs" : "py-3.5 px-4 text-fluid-sm",
            Icon && "pl-11",
            rightElement && "pr-11",
            isFocused && "border-accent/30 shadow-glow ring-1 ring-accent/10",
            error && "border-danger ring-danger/10",
            disabled && "opacity-50 cursor-not-allowed bg-card",
          )}
          {...props}
        />

        {/* Right Element (Password toggle, etc) */}
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error / Hint */}
      {error ? (
        <div className="flex items-center gap-1.5 px-1 text-danger animate-spring-up">
          <AlertCircle size={14} />
          <span className="text-fluid-xs font-medium">{error}</span>
        </div>
      ) : hint ? (
        <span className="text-fluid-xs text-subtle px-1">{hint}</span>
      ) : null}
    </div>
  );
};

export default Input;
