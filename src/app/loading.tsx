import {ShoppingBasket} from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[color-mix(in_srgb,var(--color-fondo-sitio)_80%,transparent)] text-[var(--texto-sobre-fondo)] backdrop-blur-sm transition-opacity">
      {/* Círculo*/}
      <div className="relative flex items-center justify-center">
        {/* Círculo exterior animado */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-[color-mix(in_srgb,var(--color-primario)_25%,transparent)] border-t-[var(--color-primario)]"></div>      
        {/* Un detalle*/}
        <div className="absolute text-2xl"><ShoppingBasket className="text-[var(--texto-sobre-fondo)]"/></div>
      </div>
      <h2 className="mt-4 text-lg font-semibold animate-pulse">
        Cargando datos...
      </h2>
    </div>
  );
}
