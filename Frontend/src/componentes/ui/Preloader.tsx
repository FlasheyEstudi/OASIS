"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreloaderProps {
  onComplete?: () => void;
}

const Preloader = ({ onComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulación de carga
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) setTimeout(onComplete, 500);
          }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 15);

    return () => clearInterval(timer);
  }, [onComplete]);

  const oasisText = "Oasis".split("");
  const auraText = "Aura".split("");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] bg-bg flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="flex flex-col items-center gap-12">
            {/* Logo Animado */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-20 h-20 bg-accent/10 rounded-[24px] flex items-center justify-center border border-accent/20"
              >
                <Heart className="text-accent fill-accent/20" size={40} />
              </motion.div>

              <div className="flex items-center gap-3 font-display text-fluid-2xl tracking-tighter">
                <div className="flex">
                  {oasisText.map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                      className="text-text font-bold"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
                <div className="flex">
                  {auraText.map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + i * 0.05 }}
                      className="text-accent italic font-light"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 space-y-4">
              <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-accent shadow-glow"
                />
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center text-[10px] font-mono text-subtle uppercase tracking-[0.3em]"
              >
                Cargando experiencia...
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
