import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "OASIS - Tu Base de Salud",
  description: "Oasis conecta tu receta médica con la farmacia más cercana. Salud digital para Nicaragua.",
  keywords: ["OASIS", "salud", "Nicaragua", "farmacia", "clínica", "medicina", "delivery"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/oasis-logo.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: "/oasis-logo.png",
  },
  openGraph: {
    title: "OASIS - Tu Base de Salud",
    description: "Salud digital para Nicaragua. Clínicas, farmacias y pacientes conectados.",
    images: ["/oasis-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/oasis-logo.png" />
      </head>
      <body className={`${inter.variable} ${nunito.variable} antialiased bg-white text-[#4A4A4A]`}>
        <script dangerouslySetInnerHTML={{ __html: `
          window.onerror = function(msg, url, line, col, error) {
            alert("OASIS Diagnostic Error: " + msg + "\\nAt: " + line + ":" + col);
            return false;
          };
          window.onunhandledrejection = function(event) {
            alert("OASIS Promise Error: " + event.reason);
          };
        `}} />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
