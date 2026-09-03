import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";
import { SLUGS_RESERVADOS } from "@/lib/tenants/slugs-reservados";
import type { TenantPublico } from "@/types/tenants";

const HOSTS_LOCALES = new Set(["localhost", "127.0.0.1", "::1"]);
const REVALIDACION_TENANT_SEGUNDOS = 20;
const SELECCION_TENANT = {
  id: true,
  nombre: true,
  slug: true,
  dominio: true,
  estado: true,
} as const;

async function buscarTenantPorHostname(
  hostname: string,
): Promise<TenantPublico | null> {
  const esLocal =
    HOSTS_LOCALES.has(hostname) || hostname.endsWith(".localhost");

  if (esLocal) {
    const tenantPorDominio = await prisma.tenant.findUnique({
      where: { dominio: hostname },
      select: SELECCION_TENANT,
    });
    if (tenantPorDominio) return tenantPorDominio;

    if (hostname.endsWith(".localhost")) {
      const slug = hostname.slice(0, -".localhost".length);
      if (slug && !slug.includes(".") && !SLUGS_RESERVADOS.has(slug)) {
        return prisma.tenant.findUnique({
          where: { slug },
          select: SELECCION_TENANT,
        });
      }
    }

    return prisma.tenant.findFirst({
      where: { estado: "ACTIVO" },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: SELECCION_TENANT,
    });
  }

  const tenantPorDominio = await prisma.tenant.findUnique({
    where: { dominio: hostname },
    select: SELECCION_TENANT,
  });
  if (tenantPorDominio) return tenantPorDominio;

  const dominioPrincipal = normalizarHostname(
    process.env.DOMINIO_PRINCIPAL ??
      process.env.TENANT_DOMINIO_BASE ??
      process.env.NEXT_PUBLIC_DOMINIO_PRINCIPAL ??
      "",
  );
  if (!dominioPrincipal) return null;

  const sufijo = `.${dominioPrincipal}`;
  if (!hostname.endsWith(sufijo)) return null;

  const slug = hostname.slice(0, -sufijo.length);
  if (!slug || slug.includes(".") || SLUGS_RESERVADOS.has(slug)) return null;

  return prisma.tenant.findUnique({
    where: { slug },
    select: SELECCION_TENANT,
  });
}

export async function resolverTenantPorHost(
  host: string,
): Promise<TenantPublico | null> {
  const hostname = normalizarHostname(host);
  if (!hostname) return null;

  const buscarTenantCacheado = unstable_cache(
    buscarTenantPorHostname,
    ["tenant-por-hostname", hostname],
    {
      revalidate: REVALIDACION_TENANT_SEGUNDOS,
      tags: [`tenant:${hostname}`],
    },
  );

  return buscarTenantCacheado(hostname);
}
