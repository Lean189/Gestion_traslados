import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SGT - Sistema de Gestión de Traslados",
  description: "Plataforma optimizada para la logística interna hospitalaria. Gestión de traslados de pacientes en tiempo real para sectores y áreas críticas.",
  keywords: ["gestión hospitalaria", "traslado de pacientes", "logística interna", "sanatorio", "salud"],
  authors: [{ name: "SGT Team" }],
  openGraph: {
    title: "SGT - Sistema de Gestión de Traslados",
    description: "Optimización de la logística interna y traslados de pacientes.",
    type: "website",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}
