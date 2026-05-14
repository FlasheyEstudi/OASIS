import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Médico",
  description: "Atención integral para tus pacientes con tecnología Aura.",
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
