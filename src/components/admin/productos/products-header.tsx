"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductsHeaderProps {
  onAgregar: () => void;
}

export default function ProductsHeader({ onAgregar }: ProductsHeaderProps) {
  const paleta = useAdminPaleta();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: paleta.texto }}>
          Productos
        </h1>
        <p className="mt-1 text-sm" style={{ color: paleta.textoSuave }}>
          Administrá todos los productos de tu tienda.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" onClick={onAgregar}>
          <Plus size={16} />
          Agregar producto
        </Button>
      </div>
    </div>
  );
}
