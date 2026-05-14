"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/componentes/ui/ThemeToggle";

const NavLanding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Servicios", href: "#servicios" },
    { label: "Cómo Funciona", href: "#como-funciona" },
    { label: "Nosotros", href: "#nosotros" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
      {/* DESKTOP PILL NAV */}
      <div className="max-w-5xl mx-auto hidden lg:block">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "rounded-full px-6 py-2.5 transition-all duration-500 flex items-center justify-between",
            scrolled ? "frost border border-border-light shadow-float" : "bg-transparent"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-fluid-lg font-bold tracking-tighter">
              OASIS <span className="text-accent italic font-light">AURA</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-fluid-xs font-medium text-muted hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle variant="icon" />
            <Link 
              href="/acceso/login" 
              className="text-fluid-xs font-semibold text-muted hover:text-text transition-colors ml-2"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/acceso/registro" 
              className="bg-accent text-white px-6 py-2.5 rounded-full text-fluid-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
            >
              Comenzar
            </Link>
          </div>
        </motion.div>
      </div>

      {/* MOBILE NAV */}
      <div className="lg:hidden flex justify-between items-center bg-surface/40 backdrop-blur-md rounded-2xl px-5 py-3 border border-border-light">
        <Link href="/" className="font-display text-fluid-base font-bold tracking-tighter">
          OASIS <span className="text-accent italic font-light">AURA</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-text hover:text-accent transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* FULLSCREEN MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] frost-heavy flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="font-display text-fluid-xl font-bold tracking-tighter">
                OASIS <span className="text-accent italic font-light">AURA</span>
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 bg-white/5 rounded-full text-text"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {links.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-fluid-3xl text-text hover:text-accent transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Link
                href="/acceso/login"
                className="w-full py-4 text-center text-fluid-base font-medium text-muted border border-white/5 rounded-2xl"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/acceso/registro"
                className="w-full py-5 text-center bg-accent text-white text-fluid-lg font-bold rounded-2xl flex items-center justify-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                Comenzar ahora
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavLanding;
