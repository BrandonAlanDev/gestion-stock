"use client";

import { useQuery } from "@tanstack/react-query";
import { obtenerProductosAdmin } from "@/actions/productos";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";
import type { RespuestaProductosAdmin } from "@/lib/productos/tipos";
import type { FiltrosProductos } from "@/lib/productos/query-params";

export function useProductosAdmin(filtros: FiltrosProductos) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["tenant", tenantId, "productos-admin", filtros],
    queryFn: async (): Promise<RespuestaProductosAdmin> => {
      const resultado = await obtenerProductosAdmin({
        pagina: filtros.pagina,
        limite: 20,
        busqueda: filtros.busqueda || undefined,
        categoriaId: filtros.categoriaId || undefined,
        subcategoriaId: filtros.subcategoriaId || undefined,
        proveedorId: filtros.proveedorId || undefined,
        estado: filtros.estado || undefined,
        stock: filtros.stock || undefined,
        orden: filtros.orden,
      });
      if (!resultado.success) throw new Error(resultado.error);
      return resultado;
    },
    placeholderData: (previous) => previous,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
