"use client";

import React, { useState } from "react";
import { 
  Users, Search, Filter, MoreVertical, 
  Shield, UserMinus, UserCheck, 
  Key, Mail, Phone, Calendar
} from "lucide-react";
import { useUsuarios, useCambiarRol, useDesactivarUsuario } from "@/hooks/admin";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import Input from "@/componentes/ui/Input";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const UsuariosAdmin = () => {
  const [search, setSearch] = useState("");
  const { data: usuarios, isLoading } = useUsuarios({ q: search });
  const { mutate: cambiarRol } = useCambiarRol();
  const { mutate: desactivar } = useDesactivarUsuario();

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full max-w-md">
          <Input 
            label="Buscador Usuarios"
            placeholder="Buscar por nombre, email o ID..." 
            icon={Search}
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" icon={Filter}>Filtrar por Rol</Button>
          <Button icon={Users}>Exportar Datos</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {usuarios?.map((user: any, idx: number) => (
          <Reveal key={user.id} delay={idx * 0.05}>
            <Card className="p-6 group hover:border-accent/30 transition-all">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Avatar name={user.name} size="lg" className="border-2 border-accent/10" />
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <h4 className="text-fluid-base font-bold">{user.name}</h4>
                    <Badge variant="glass" size="xs" className="uppercase tracking-widest">{user.role}</Badge>
                    {!user.isActive && <Badge variant="danger" size="xs">Inactivo</Badge>}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px] text-muted font-mono">
                    <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {user.phone || "No tel"}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Miembro desde May 2024</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" icon={Key}>Permisos</Button>
                  <Button 
                    variant={user.isActive ? "danger" : "primary"} 
                    size="sm" 
                    icon={user.isActive ? UserMinus : UserCheck}
                    onClick={() => desactivar(user.id)}
                  >
                    {user.isActive ? "Suspender" : "Activar"}
                  </Button>
                  <Button variant="ghost" size="sm" icon={MoreVertical} />
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default UsuariosAdmin;
