"use client";

import React from "react";
import { motion } from "framer-motion";

const OasisBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Blob 1: Superior Izquierda */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[150px] -left-[100px] w-[600px] h-[600px] rounded-full bg-accent/5 dark:bg-accent/10 blur-[120px] lg:blur-[150px]"
      />

      {/* Blob 2: Inferior Derecha */}
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[200px] -right-[100px] w-[500px] h-[500px] rounded-full bg-info/5 dark:bg-info/10 blur-[100px] lg:blur-[120px]"
      />

      {/* Blob 3: Central (Sutil) */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-success/2 dark:bg-success/5 blur-[180px]"
      />
    </div>
  );
};

export default OasisBackground;
