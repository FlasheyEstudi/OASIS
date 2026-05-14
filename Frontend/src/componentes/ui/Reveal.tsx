"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  once?: boolean;
}

export const Reveal = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
  once = true,
}: RevealProps) => {
  const getInitialProps = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 40 };
      case "down":
        return { opacity: 0, y: -40 };
      case "left":
        return { opacity: 0, x: 40 };
      case "right":
        return { opacity: 0, x: -40 };
      default:
        return { opacity: 0, y: 40 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialProps()}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: delay,
      }}
      viewport={{ once, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
};
