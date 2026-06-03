import "./globals.css";
import { auth } from "@/auth";
import type { Metadata } from "next";
import AppGate from "@/components/layout/AppGate";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import RouteLoader from "@/components/layout/RouteLoader";
import LayoutComponent from "@/components/layout/LayoutComponent";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { getBrandingConfig } from "@/actions/page-config/branding.actions";
import { PageConfigProvider } from "@/components/providers/PageConfigProvider";

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
        <QueryProvider>
          <PageConfigProvider pageConfig={pageConfig}>
            <LayoutComponent>
              <AppGate>
                <RouteLoader />
                {children}
              </AppGate>
            </LayoutComponent>
          </PageConfigProvider>
        </QueryProvider>
      </body>
    </html>
  );
}