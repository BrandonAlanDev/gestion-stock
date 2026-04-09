import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
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
    <html lang="es" className="dark"> 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw max-w-dvw overflow-x-hidden bg-black text-white`}>
        
        <NextTopLoader 
          color="#f59e0b" 
          showSpinner={false}
          height={3}
          zIndex={9999}
          shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
        />
        
        <LayoutComponent session={session}>
            {children}
        </LayoutComponent>
      </body>
    </html>
  );
}