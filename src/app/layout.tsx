import "./globals.css";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { ProveedorConfiguracionPagina } from "@/components/providers/ProveedorConfiguracionPagina";
import EstilosApariencia from "@/components/apariencia/EstilosApariencia";
import FuentesGoogle from "@/components/apariencia/FuentesGoogle";
import SessionWrapper from "@/components/providers/SessionWrapper";
import { obtenerVariablesTema } from "@/lib/apariencia/obtener-variables-tema";
import { obtenerConfiguracionPaginaSolicitud } from "@/lib/configuracion-pagina/obtener-configuracion-pagina-solicitud";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { pageConfig } = await obtenerConfiguracionPaginaSolicitud();
  const favicon = pageConfig?.favicon?.trim() || "/favicon.ico";

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
      icon: favicon,
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
  const session = await auth();
  const configuracion = await obtenerConfiguracionPaginaSolicitud();
  const pageConfig = configuracion.pageConfig;

  return (
    <html
      lang="es"
      className="dark"
      style={obtenerVariablesTema(
        (pageConfig ?? {}) as Record<string, unknown>
      ) as React.CSSProperties}
    >
      <body
        style={{ backgroundColor: "var(--color-fondo-sitio)" }}
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw max-w-dvw overflow-x-hidden text-[var(--texto-sobre-fondo)]`}
      >
        <SessionWrapper session={session}>
          <QueryProvider>
            <ProveedorConfiguracionPagina
              pageConfig={{
                ok: configuracion.ok,
                pageConfig: pageConfig ?? {},
              }}
            >
              <FuentesGoogle
                pageConfig={(pageConfig ?? {}) as Record<string, unknown>}
              />
              <EstilosApariencia />
              {children}
            </ProveedorConfiguracionPagina>
          </QueryProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
