import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión Farmacéutica",
  description: "Control de inventario y pedidos inteligentes.",
};

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
