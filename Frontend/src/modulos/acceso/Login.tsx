"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useToast } from "@/componentes/ui/Toast";
import Input from "@/componentes/ui/Input";
import Button from "@/componentes/ui/Button";
import { Reveal } from "@/componentes/ui/Reveal";
import { clienteApi } from "@/servicios/cliente";

const LoginModulo = () => {
  const router = useRouter();
  const { show } = useToast();
  const login = useAuthStore((state) => state.login);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await clienteApi.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { data } = response.data;

      login({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      show({
        type: "success",
        title: "¡Bienvenido de vuelta!",
        message: `Hola ${data.user.name}, un gusto verte de nuevo.`,
      });

      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Las credenciales no coinciden con nuestros registros.";
      show({
        type: "error",
        title: "Error de acceso",
        message: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Form */}
      <Reveal direction="up" delay={0.1}>
        <div className="space-y-3">
          <Link href="/" className="hidden lg:block font-display text-fluid-xl font-bold tracking-tighter mb-8">
            OASIS <span className="text-accent italic font-light">AURA</span>
          </Link>
          <h1 className="font-display text-fluid-3xl font-light text-text leading-tight">
            Iniciar Sesión
          </h1>
          <p className="font-body text-fluid-sm text-muted font-light">
            Ingresa tus credenciales para continuar al ecosistema Aura.
          </p>
        </div>
      </Reveal>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Reveal direction="up" delay={0.2}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="tu@oasis.com"
            icon={Mail}
            value={formData.email}
            onChange={(val) => setFormData({ ...formData, email: val })}
            required
            disabled={loading}
          />
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={(val) => setFormData({ ...formData, password: val })}
            required
            disabled={loading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-accent transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </Reveal>

        <Reveal direction="up" delay={0.4}>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent/30 transition-all"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              />
              <span className="text-fluid-xs text-muted group-hover:text-text transition-colors">
                Recordarme
              </span>
            </label>
            <Link 
              href="/acceso/recuperar" 
              className="text-fluid-xs font-semibold text-accent hover:text-accent-light transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.5}>
          <Button
            type="submit"
            variant="primary"
            size="xl"
            fullWidth
            loading={loading}
            iconRight={ArrowRight}
          >
            Entrar
          </Button>
        </Reveal>
      </form>

      {/* Footer Form */}
      <Reveal direction="up" delay={0.6}>
        <div className="space-y-6 text-center">
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] font-mono text-subtle uppercase tracking-widest">o</span>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <p className="text-fluid-sm text-muted">
            ¿No tienes una cuenta?{" "}
            <Link 
              href="/acceso/registro" 
              className="font-bold text-text hover:text-accent transition-all underline underline-offset-4 decoration-accent/30"
            >
              Regístrate ahora
            </Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
};

export default LoginModulo;
