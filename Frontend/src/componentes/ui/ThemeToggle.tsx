"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/almacenes/usoTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown";
  className?: string;
}

const ThemeToggle = ({ variant = "icon", className }: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const sequence: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const nextIndex = (sequence.indexOf(theme) + 1) % sequence.length;
    setTheme(sequence[nextIndex]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Oscuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ] as const;

  if (variant === "dropdown") {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-surface transition-colors"
        >
          {resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-fluid-sm font-medium">Tema</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-48 frost-heavy rounded-2xl border border-border shadow-float z-50 overflow-hidden"
            >
              <div className="p-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300",
                      theme === t.id 
                        ? "bg-accent/10 text-accent" 
                        : "text-muted hover:bg-white/5 hover:text-text"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <t.icon size={16} />
                      <span className="text-fluid-xs font-medium">{t.label}</span>
                    </div>
                    {theme === t.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-11 h-11 rounded-xl flex items-center justify-center hover:bg-surface transition-all duration-500 overflow-hidden group",
        className
      )}
      title={`Cambiar tema (Actual: ${theme})`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          className="text-accent"
        >
          {theme === "light" && <Sun size={20} />}
          {theme === "dark" && <Moon size={20} />}
          {theme === "system" && <Monitor size={20} />}
        </motion.div>
      </AnimatePresence>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default ThemeToggle;
