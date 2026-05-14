"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Input from "@/componentes/ui/Input";
import Button from "@/componentes/ui/Button";
import { Reveal } from "@/componentes/ui/Reveal";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setEnviado(true);
    setLoading(false);
  };

  if (enviado) {
    return (
      <Reveal direction="up" className="text-center space-y-8">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto border border-success/20">
          <CheckCircle2 className="text-success" size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="font-display text-fluid-3xl font-light text-text">Revisa tu correo</h1>
          <p className="font-body text-fluid-sm text-muted max-w-sm mx-auto">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada y spam.
          </p>
        </div>
        <Button variant="secondary" fullWidth onClick={() => setEnviado(false)}>
          No recibí nada, intentar de nuevo
        </Button>
        <Link 
          href="/acceso/login" 
          className="block text-fluid-xs font-bold uppercase tracking-widest text-accent hover:text-accent-light transition-colors"
        >
          Volver al Inicio de Sesión
        </Link>
      </Reveal>
    );
  }

  return (
    <div className="space-y-10">
      <Reveal direction="up" delay={0.1}>
        <div className="space-y-3">
          <Link href="/acceso/login" className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-fluid-xs font-bold uppercase tracking-widest">Volver</span>
          </Link>
          <h1 className="font-display text-fluid-3xl font-light text-text leading-tight">
            Recuperar Acceso
          </h1>
          <p className="font-body text-fluid-sm text-muted font-light">
            No te preocupes, suele pasar. Ingresa tu email y te ayudaremos a volver.
          </p>
        </div>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Reveal direction="up" delay={0.2}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="tu@correo.com"
            icon={Mail}
            value={email}
            onChange={setEmail}
            required
            disabled={loading}
          />
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <Button
            type="submit"
            variant="primary"
            size="xl"
            fullWidth
            loading={loading}
          >
            Enviar Instrucciones
          </Button>
        </Reveal>
      </form>
    </div>
  );
}
