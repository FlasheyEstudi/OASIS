"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setReconnecting(true);
      setTimeout(() => {
        setIsOffline(false);
        setReconnecting(false);
      }, 2000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] px-6 py-2 bg-danger text-white flex items-center justify-center gap-3 shadow-glow-danger/20"
        >
          {reconnecting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Restaurando conexión...</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Sin conexión a internet. Trabajando en modo offline.</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
