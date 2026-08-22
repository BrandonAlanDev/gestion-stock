import "./globals.css";
import { cache } from "react";
import { auth } from "@/auth";
import type { Metadata } from "next";
import AppGate from "@/components/layout/AppGate";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import RouteLoader from "@/components/layout/RouteLoader";
import LayoutComponent from "@/components/layout/LayoutComponent";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { PageConfigProvider } from "@/components/providers/PageConfigProvider";
import EstilosApariencia from "@/components/apariencia/EstilosApariencia";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const getCachedPageConfig = cache(async () => {
  return await getPageConfig();
});

export async function generateMetadata(): Promise<Metadata> {
  const { pageConfig } = await getCachedPageConfig();

  return {
    title:
      pageConfig?.metaTitle ??
      pageConfig?.storeName ??
      "Gestión de Stock",

    description:
      pageConfig?.metaDescription ??
      pageConfig?.description ??
      "Sistema de gestión de stock",

    icons: {
      icon: pageConfig?.favicon ?? "/favicon.ico",
      shortcut: pageConfig?.favicon ?? "/favicon.ico",
      apple: pageConfig?.favicon ?? "/favicon.ico",
    },

    openGraph: {
      title:
        pageConfig?.metaTitle ??
        pageConfig?.storeName ??
        "Gestión de Stock",

      description:
        pageConfig?.metaDescription ??
        pageConfig?.description ??
        "",

      images: pageConfig?.logo
        ? [
            {
              url: pageConfig.logo,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title:
        pageConfig?.metaTitle ??
        pageConfig?.storeName ??
        "Gestión de Stock",

      description:
        pageConfig?.metaDescription ??
        pageConfig?.description ??
        "",

      images: pageConfig?.logo ? [pageConfig.logo] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth();
  const pageConfig = await getCachedPageConfig();

  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw max-w-dvw overflow-x-hidden bg-black text-white`}
      >
        <QueryProvider>
          <PageConfigProvider pageConfig={pageConfig}>
            <EstilosApariencia />
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