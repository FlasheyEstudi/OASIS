"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export const Navegacion = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Servicios", href: "#servicios" },
    { name: "Cómo Funciona", href: "#como-funciona" },
    { name: "Nosotros", href: "#nosotros" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? "py-4 glass" : "py-8 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-1">
            <span className="font-display text-2xl font-semibold tracking-tight text-text">
              Oasis <span className="text-accent group-hover:text-accent-light transition-colors">Aura</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-fluid-sm font-medium text-muted hover:text-text transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/auth/login"
              className="text-fluid-sm font-medium text-muted hover:text-text transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/registro"
              className="px-6 py-2.5 bg-accent hover:bg-accent-light text-bg font-semibold rounded-2xl transition-all duration-300 shadow-glow-accent hover:scale-[1.02] active:scale-[0.98]"
            >
              Comenzar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 text-text hover:text-accent transition-colors w-12 h-12 flex items-center justify-center"
            aria-label="Abrir menú"
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-surface flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-end mb-12">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-text hover:text-accent transition-colors w-12 h-12 flex items-center justify-center"
                aria-label="Cerrar menú"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-display text-4xl font-medium text-text hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <hr className="border-border my-4" />
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-6"
              >
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-display text-3xl text-muted hover:text-text transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/registro"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-fit px-8 py-4 bg-accent text-bg text-xl font-semibold rounded-2xl shadow-glow-accent"
                >
                  Comenzar
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
