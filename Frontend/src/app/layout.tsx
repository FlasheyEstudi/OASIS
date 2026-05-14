import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google";
import React from "react";
import "../estilos/globals.css";
import { Proveedores } from "./proveedores";
import PreloaderManager from "@/componentes/layout/PreloaderManager";
import PageTransition from "@/componentes/ui/PageTransition";
import OfflineBanner from "@/componentes/layout/OfflineBanner";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Oasis Aura — Salud de Próxima Generación",
    template: "%s | Oasis Aura"
  },
  description: "Experiencia de salud digital premium, cálida y orgánica. Citas médicas, farmacia inteligente y seguimiento en tiempo real.",
  openGraph: {
    title: "Oasis Aura — Tu Oasis de Salud",
    description: "Cuidado médico con estética Apple y tecnología de vanguardia.",
    type: "website",
    locale: "es_NI",
    siteName: "Oasis Aura",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080A08",
};

import ThemeProvider from "@/componentes/layout/ThemeProvider";
import NotificationManager from "@/componentes/layout/NotificationManager";
import OasisBackground from "@/componentes/ui/OasisBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="es" 
      className={`${cormorant.variable} ${dmSans.variable} ${jetbrains.variable}`} 
      suppressHydrationWarning
    >
      <body className="font-body bg-bg text-text antialiased overflow-x-hidden selection:bg-accent selection:text-white">
        <ThemeProvider>
          <OasisBackground />
          <NotificationManager />
          <Proveedores>
            <a href="#main-content" className="sr-only focus:not-sr-only fixed top-4 left-4 z-[99999] bg-accent text-white px-4 py-2 rounded-full font-bold">
              Saltar al contenido
            </a>
            <OfflineBanner />
            <PreloaderManager>
              <PageTransition>
                <main id="main-content">
                  {children}
                </main>
              </PageTransition>
            </PreloaderManager>
          </Proveedores>
        </ThemeProvider>
      </body>
    </html>
  );
}
