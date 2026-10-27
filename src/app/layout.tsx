import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORB-SYS // HUD - Simulador Orbital 2D",
  description:
    "Simulador interactivo de mecánica orbital y gravitatoria en 2D con telemetría en tiempo real y validación teórica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
