"use client";

import { PackageOpen, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductsEmptyStateProps {
  conFiltros: boolean;
  onAgregar?: () => void;
  onLimpiar?: () => void;
}

export default function ProductsEmptyState({ conFiltros, onAgregar, onLimpiar }: ProductsEmptyStateProps) {
  const paleta = useAdminPaleta();
  const Icono = conFiltros ? SearchX : PackageOpen;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 80, height: 80, border: `1px solid ${paleta.borde}`, backgroundColor: paleta.fondoSuave }}
      >
        <Icono size={40} style={{ color: paleta.textoSuave }} />
      </div>
      <h3 className="mt-6 text-lg font-semibold" style={{ color: paleta.texto }}>
        {conFiltros ? "No encontramos productos" : "No hay productos todavía"}
      </h3>
      <p className="mt-2 max-w-sm text-sm" style={{ color: paleta.textoSuave }}>
        {conFiltros
          ? "Probá cambiando la búsqueda o eliminando algunos filtros."
          : "Agregá tu primer producto para comenzar a administrar el catálogo."}
      </p>
      <div className="mt-6">
        <Button variant={conFiltros ? "outline" : "default"} size="sm" onClick={conFiltros ? onLimpiar : onAgregar}>
          {conFiltros ? (
            "Limpiar filtros"
          ) : (
            <>
              <Plus size={16} />
              Agregar producto
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
