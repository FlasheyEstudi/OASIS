import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración Global",
  description: "Supervisión total del ecosistema Oasis Aura.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
