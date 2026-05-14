"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalendarioSimpleProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
}

const CalendarioSimple = ({ onDateSelect, selectedDate, minDate = new Date() }: CalendarioSimpleProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day);
    return date < new Date(minDate.setHours(0, 0, 0, 0));
  };

  return (
    <div className="p-6 bg-card border border-border rounded-[32px] frost w-full max-w-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h4 className="font-display text-fluid-lg font-light text-text">{monthNames[month]}</h4>
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest">{year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-surface rounded-xl transition-colors text-muted hover:text-text">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-surface rounded-xl transition-colors text-muted hover:text-text">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((d) => (
          <div key={d} className="h-10 flex items-center justify-center text-[10px] font-mono text-muted uppercase font-bold">
            {d}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-1"
        >
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const disabled = isDisabled(day);
            const active = isSelected(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => onDateSelect?.(new Date(year, month, day))}
                className={cn(
                  "h-12 rounded-[14px] text-fluid-xs font-bold transition-all relative group",
                  active ? "bg-accent text-white shadow-glow-accent" : "hover:bg-surface text-text",
                  disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer",
                  today && !active && "border border-accent/30 text-accent"
                )}
              >
                {day}
                {today && !active && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarioSimple;
