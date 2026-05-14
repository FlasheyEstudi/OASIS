import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal del Paciente",
  description: "Gestiona tu salud, citas y medicamentos desde tu oasis digital.",
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
