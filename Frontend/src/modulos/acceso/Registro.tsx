"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Stethoscope, Store, Truck, 
  ArrowRight, ArrowLeft, Mail, Lock, User, 
  Phone, Briefcase, MapPin, ShieldCheck,
  Eye, EyeOff
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useToast } from "@/componentes/ui/Toast";
import Input from "@/componentes/ui/Input";
import Button from "@/componentes/ui/Button";
import Card from "@/componentes/ui/Card";
import PasswordStrength from "@/componentes/ui/PasswordStrength";
import { Reveal } from "@/componentes/ui/Reveal";
import { clienteApi } from "@/servicios/cliente";
import { useRouter } from "next/navigation";

type Rol = "patient" | "doctor" | "pharmacy_admin" | "delivery_person";

const RegistroModulo = () => {
  const { show } = useToast();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Campos específicos
    phone: "",
    specialty: "",
    licenseNumber: "",
    pharmacyName: "",
    address: "",
    vehicleType: "",
    terms: false,
  });

  const roles = [
    { id: "patient" as Rol, label: "Paciente", desc: "Gestiona tu salud", icon: Heart, color: "text-accent", glow: "bg-accent-glow" },
    { id: "doctor" as Rol, label: "Doctor", desc: "Atiende pacientes", icon: Stethoscope, color: "text-success", glow: "bg-success/10" },
    { id: "pharmacy_admin" as Rol, label: "Farmacia", desc: "Vende medicamentos", icon: Store, color: "text-info", glow: "bg-info/10" },
    { id: "delivery_person" as Rol, label: "Repartidor", desc: "Entrega pedidos", icon: Truck, color: "text-warning", glow: "bg-warning/10" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      show({ type: "error", title: "Error", message: "Las contraseñas no coinciden." });
      return;
    }
    if (!formData.terms) {
      show({ type: "warning", title: "Aviso", message: "Debes aceptar los términos y condiciones." });
      return;
    }

    setLoading(true);
    try {
      const response = await clienteApi.post("/auth/register", {
        ...formData,
        role: rolSeleccionado
      });

      const { data } = response.data;

      show({
        type: "success",
        title: "Cuenta creada",
        message: "¡Bienvenido a Oasis Aura! Tu viaje comienza ahora.",
      });

      // Auto-login tras registro
      useAuthStore.getState().login({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      window.location.href = "/dashboard";
    } catch (error: any) {
      const message = error.response?.data?.message || "Hubo un problema al crear tu cuenta.";
      show({ type: "error", title: "Error de registro", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Paso 1: Selección de Rol */}
      <AnimatePresence mode="wait">
        {paso === 1 ? (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <h1 className="font-display text-fluid-3xl font-light text-text leading-tight">
                Únete a Oasis Aura
              </h1>
              <p className="font-body text-fluid-sm text-muted font-light">
                Selecciona cómo quieres usar la plataforma para personalizar tu experiencia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((rol) => (
                <button
                  key={rol.id}
                  onClick={() => setRolSeleccionado(rol.id)}
                  className={`relative p-6 rounded-[24px] border transition-all duration-500 text-left group ${
                    rolSeleccionado === rol.id 
                      ? `border-accent bg-surface shadow-glow` 
                      : "border-border bg-surface/50 hover:border-border-hover"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    rolSeleccionado === rol.id ? rol.glow : "bg-card"
                  }`}>
                    <rol.icon className={rolSeleccionado === rol.id ? rol.color : "text-subtle"} size={24} />
                  </div>
                  <h3 className="font-display text-fluid-lg font-light text-text mb-1">
                    {rol.label}
                  </h3>
                  <p className="text-fluid-xs text-muted font-light">
                    {rol.desc}
                  </p>
                  
                  {rolSeleccionado === rol.id && (
                    <motion.div 
                      layoutId="check"
                      className="absolute top-4 right-4 text-accent"
                    >
                      <ShieldCheck size={20} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="xl"
              fullWidth
              disabled={!rolSeleccionado}
              onClick={() => setPaso(2)}
              iconRight={ArrowRight}
            >
              Continuar
            </Button>

            <p className="text-center text-fluid-sm text-muted">
              ¿Ya tienes cuenta?{" "}
              <Link href="/acceso/login" className="font-bold text-text hover:text-accent underline underline-offset-4 decoration-accent/30">
                Inicia sesión
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setPaso(1)}
                className="flex items-center gap-2 text-muted hover:text-text transition-colors group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-fluid-xs font-bold uppercase tracking-widest">Volver</span>
              </button>
              <span className="text-[10px] font-mono text-accent uppercase tracking-widest">
                Paso 2 de 2
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-fluid-2xl font-light text-text leading-tight">
                Tus datos de {roles.find(r => r.id === rolSeleccionado)?.label}
              </h2>
              <p className="font-body text-fluid-sm text-muted font-light">
                Completa el formulario para finalizar tu registro.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nombre Completo"
                placeholder="Juan Pérez"
                icon={User}
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                required
              />
              
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="juan@ejemplo.com"
                icon={Mail}
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                required
              />

              <div className="space-y-4">
                <Input
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={(val) => setFormData({ ...formData, password: val })}
                  required
                  rightElement={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                <PasswordStrength password={formData.password} />
              </div>

              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                required
              />

              {/* Campos dinámicos por rol */}
              {rolSeleccionado === "patient" && (
                <Input
                  label="Teléfono"
                  placeholder="+52 123 456 7890"
                  icon={Phone}
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                />
              )}

              {rolSeleccionado === "doctor" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Especialidad"
                    placeholder="Cardiología"
                    icon={Briefcase}
                    value={formData.specialty}
                    onChange={(val) => setFormData({ ...formData, specialty: val })}
                  />
                  <Input
                    label="Cédula"
                    placeholder="12345678"
                    icon={ShieldCheck}
                    value={formData.licenseNumber}
                    onChange={(val) => setFormData({ ...formData, licenseNumber: val })}
                  />
                </div>
              )}

              {(rolSeleccionado === "pharmacy_admin" || rolSeleccionado === "delivery_person") && (
                <Input
                  label={rolSeleccionado === "pharmacy_admin" ? "Nombre Farmacia" : "Zona de Entrega"}
                  placeholder={rolSeleccionado === "pharmacy_admin" ? "Farmacia Aura Centro" : "CDMX Norte"}
                  icon={MapPin}
                  value={formData.address}
                  onChange={(val) => setFormData({ ...formData, address: val })}
                />
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent/30 transition-all"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                />
                <span className="text-fluid-xs text-muted group-hover:text-text transition-colors">
                  Acepto los <Link href="#" className="text-accent font-bold">Términos y Condiciones</Link> y la <Link href="#" className="text-accent font-bold">Política de Privacidad</Link>.
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="xl"
                fullWidth
                loading={loading}
              >
                Crear Cuenta
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistroModulo;
