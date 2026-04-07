import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
// 1. Importa el cargador
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión de Stock",
  description: "Sistema de gestión de stock - Administra tus productos de manera eficiente.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw max-w-dvw overflow-x-hidden`}>
        {/* 2. Implementa el loader aquí */}
        <NextTopLoader 
          color="#6fa9da" // Tu color celeste característico
          showSpinner={true}
          height={3}
          zIndex={9999}
        />
        
        <LayoutComponent session={session}>
            {children}
        </LayoutComponent>
      </body>
    </html>
  );
}