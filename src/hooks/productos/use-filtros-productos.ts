"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { leerFiltrosDesdeUrl } from "@/lib/productos/query-params";
import { serializarFiltros } from "@/lib/productos/serializar-filtros-url";
import type { FiltrosProductos } from "@/lib/productos/query-params";

export function useFiltrosProductos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filtros = useMemo(
    () => leerFiltrosDesdeUrl(searchParams),
    [searchParams]
  );

  const actualizar = useCallback(
    (parcial: Partial<FiltrosProductos>) => {
      const nuevos: FiltrosProductos = { ...filtros, ...parcial };
      const params = serializarFiltros(nuevos);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filtros, router, pathname]
  );

  const limpiar = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filtros, actualizar, limpiar };
}
