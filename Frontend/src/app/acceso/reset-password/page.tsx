"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/componentes/ui/Toast";
import Input from "@/componentes/ui/Input";
import Button from "@/componentes/ui/Button";
import PasswordStrength from "@/componentes/ui/PasswordStrength";
import { Reveal } from "@/componentes/ui/Reveal";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  
  const token = searchParams?.get("token");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      router.push("/acceso/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      show({ type: "error", title: "Error", message: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    show({
      type: "success",
      title: "Contraseña restablecida",
      message: "Ya puedes iniciar sesión con tu nueva contraseña.",
    });
    
    router.push("/acceso/login");
    setLoading(false);
  };

  if (!token) return null;

  return (
    <div className="space-y-10">
      <Reveal direction="up" delay={0.1}>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
            <ShieldCheck className="text-accent" size={24} />
          </div>
          <h1 className="font-display text-fluid-3xl font-light text-text leading-tight">
            Nueva Contraseña
          </h1>
          <p className="font-body text-fluid-sm text-muted font-light">
            Asegúrate de que tu nueva contraseña sea segura y diferente a las anteriores.
          </p>
        </div>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Reveal direction="up" delay={0.2}>
          <div className="space-y-4">
            <Input
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(val) => setFormData({ ...formData, password: val })}
              required
              disabled={loading}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <PasswordStrength password={formData.password} />
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
            required
            disabled={loading}
          />
        </Reveal>

        <Reveal direction="up" delay={0.4}>
          <Button
            type="submit"
            variant="primary"
            size="xl"
            fullWidth
            loading={loading}
          >
            Restablecer Contraseña
          </Button>
        </Reveal>
      </form>
    </div>
  );
}
