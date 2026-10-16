import "dotenv/config";
import { conPrismaTenant, invalidarClientesPrismaTenant } from "../src/lib/tenants/prisma-factory";
import { obtenerProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import { normalizarValorEnlace } from "../src/lib/enlaces/normalizar-valor-enlace";

function enlaceLimpio(url: string): string | null {
  if (url.startsWith("/productos?categoria=")) {
    const destino = normalizarValorEnlace(url);
    return destino ? `/productos?categoria=${encodeURIComponent(destino)}` : null;
  }
  if (url.startsWith("/productos/item/")) {
    const destino = normalizarValorEnlace(url);
    return destino ? `/productos/item/${destino}` : null;
  }
  return url;
}

async function main(): Promise<void> {
  const registro = obtenerProveedorRegistroTenant();
  const tenantId = process.env.TENANT_ID?.trim();
  const incluirTodos = process.argv.includes("--todos");
  if (!tenantId && !incluirTodos) {
    throw new Error("Definí TENANT_ID o pasá --todos para ejecutar la limpieza en todos los tenants activos");
  }

  const tenants = tenantId
    ? [await registro.resolverPorId(tenantId)].filter((tenant) => tenant?.tenant.estado === "ACTIVO")
    : (await registro.listarTenants()).filter((tenant) => tenant.tenant.estado === "ACTIVO");
  if (tenants.length === 0) throw new Error("No se encontraron tenants activos para procesar");

  try {
    for (const entry of tenants) {
      if (!entry) continue;
      const resultado = await conPrismaTenant(entry.tenant.id, async (cliente) => {
        const slides = await cliente.carouselSlide.findMany({
          select: { id: true, url: true },
        });
        let actualizadas = 0;
        for (const slide of slides) {
          if (!slide.url) continue;
          const limpio = enlaceLimpio(slide.url);
          if (!limpio || limpio === slide.url) continue;
          await cliente.carouselSlide.update({
            where: { id: slide.id },
            data: { url: limpio },
          });
          actualizadas++;
        }
        return { revisadas: slides.length, actualizadas };
      });
      console.log(`${entry.tenant.slug}: ${resultado.revisadas} diapositivas · ${resultado.actualizadas} enlaces normalizados`);
      await invalidarClientesPrismaTenant(entry.tenant.id);
    }
  } finally {
    await Promise.all(tenants.filter(Boolean).map((entry) => invalidarClientesPrismaTenant(entry!.tenant.id)));
  }
}

void main().catch((error: unknown) => {
  console.error("Error al limpiar enlaces de carrusel:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
