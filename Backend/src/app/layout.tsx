import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oasis - Tu Base de Salud",
  description: "Plataforma de salud nicaraguense que conecta clinicas, farmacias y pacientes. Backend API con 143 endpoints, 36 tablas y 22 modulos.",
  keywords: ["Oasis", "Nicaragua", "salud", "clinicas", "farmacias", "pacientes", "delivery", "recetas", "teleconsulta"],
  authors: [{ name: "Oasis Team" }],
  icons: {
    icon: "/oasis-icon.png",
  },
  openGraph: {
    title: "Oasis - Tu Base de Salud",
    description: "Plataforma de salud nicaraguense",
    siteName: "Oasis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oasis - Tu Base de Salud",
    description: "Plataforma de salud nicaraguense",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
