"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Button from "@/componentes/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-success/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-accent text-fluid-xl font-bold tracking-[0.2em] opacity-50">
            404
          </span>
          <h1 className="font-display text-fluid-4xl font-light text-text mt-4 leading-tight">
            Te has perdido en <br />
            <span className="italic text-accent">el desierto.</span>
          </h1>
          <p className="text-fluid-base text-muted font-light mt-6 leading-relaxed">
            La página que buscas no existe o ha sido movida a un nuevo oasis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col gap-4 pt-6"
        >
          <Link href="/">
            <Button variant="primary" fullWidth size="xl" icon={Home}>
              Volver al Inicio
            </Button>
          </Link>
          <button onClick={() => window.history.back()} className="text-fluid-sm text-subtle hover:text-accent transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            <span>Regresar</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
