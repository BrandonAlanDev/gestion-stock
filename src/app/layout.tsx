import "./globals.css";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { ProveedorConfiguracionPagina } from "@/components/providers/ProveedorConfiguracionPagina";
import EstilosApariencia from "@/components/apariencia/EstilosApariencia";
import FuentesGoogle from "@/components/apariencia/FuentesGoogle";
import { TenantProvider } from "@/contextos/tenants/proveedor-tenant";
import { obtenerVariablesTema } from "@/lib/apariencia/obtener-variables-tema";
import { obtenerConfiguracionPaginaSolicitud } from "@/lib/configuracion-pagina/obtener-configuracion-pagina-solicitud";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";

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
  const [tenant, configuracion] = await Promise.all([
    obtenerTenantPublico(),
    obtenerConfiguracionPaginaSolicitud(),
  ]);
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
        <TenantProvider tenantId={tenant?.id ?? null}>
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
        </TenantProvider>
      </body>
    </html>
  );
}
