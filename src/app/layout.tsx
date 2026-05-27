import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
import RouteLoader from "@/components/RouteLoader";
import AppGate from "@/components/AppGate";
import {
  getBrandingConfig,
} from "@/actions/page-config/branding.actions";

import {
  getPageConfig,
} from "@/actions/page-config/general.actions";

import {
  PageConfigProvider,
} from "@/components/providers/PageConfigProvider";

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
  const branding = await getBrandingConfig();
  const pageConfig = await getPageConfig();
  return (
    <html lang="es" className="dark"> 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw max-w-dvw overflow-x-hidden bg-black text-white`}>
        <PageConfigProvider pageConfig={pageConfig}>
          <LayoutComponent session={session} branding={branding}>
            <AppGate>
              <RouteLoader />
              {children}
            </AppGate>
          </LayoutComponent>
        </PageConfigProvider>
      </body>
    </html>
  );
}