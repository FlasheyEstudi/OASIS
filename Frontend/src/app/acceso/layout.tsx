"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/componentes/ui/Reveal";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex bg-bg overflow-hidden">
      {/* LADO VISUAL (Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 overflow-hidden bg-surface/30">
        {/* Animated Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-success/5 blur-[100px] rounded-full animate-pulse" />
        
        <div className="relative z-10 max-w-sm">
          <Reveal delay={0.2}>
            <div className="font-display text-fluid-4xl md:text-fluid-hero font-light text-text leading-[1.1] tracking-tighter">
              <span className="block">Bienvenido</span>
              <span className="block italic text-accent">Aura Oasis</span>
            </div>
          </Reveal>
          
          <Reveal delay={0.4}>
            <p className="mt-8 font-body text-fluid-base text-muted font-light leading-relaxed">
              La armonía perfecta entre tecnología y bienestar. Gestiona tu salud con la serenidad que mereces.
            </p>
          </Reveal>

          {/* Formas orgánicas decorativas */}
          <div className="mt-16 relative">
            <motion.div 
              animate={{ 
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 border border-accent/20 bg-accent/5 backdrop-blur-sm"
            />
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, -45, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-info/10 blur-sm border border-info/20"
            />
          </div>
        </div>
      </div>

      {/* LADO FORMULARIO */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative">
        {/* Logo Mobile */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="font-display text-fluid-xl font-bold tracking-tighter">
            OASIS <span className="text-accent italic font-light">AURA</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer sutil */}
        <div className="absolute bottom-8 text-center w-full lg:w-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-subtle">
            Oasis Health © 2026 — Protocolo Aura v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
