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
  title: "ColorCheck - Analizador de Accesibilidad de Colores",
  description: "Herramienta para analizar la accesibilidad de paletas de colores según los estándares WCAG AA y AAA",
  keywords: ["accesibilidad", "colores", "WCAG", "contraste", "diseño web"],
  authors: [{ name: "ColorCheck Team" }],
  viewport: "width=device-width, initial-scale=1",
};

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
        <div id="root" role="main">
          {children}
        </div>
      </body>
    </html>
  );
}
