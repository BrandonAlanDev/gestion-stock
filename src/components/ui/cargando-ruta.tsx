import { ShoppingBasket } from "lucide-react";

export default function CargandoRuta() {
  return (
    <div
      role="status"
      aria-label="Cargando datos"
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[color-mix(in_srgb,var(--color-fondo-sitio)_80%,transparent)] text-[var(--texto-sobre-fondo)] backdrop-blur-sm"
    >
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-[color-mix(in_srgb,var(--color-primario)_25%,transparent)] border-t-[var(--color-primario)]" />
        <ShoppingBasket className="absolute" aria-hidden="true" />
      </div>
      <span className="mt-4 animate-pulse text-lg font-semibold">Cargando datos...</span>
    </div>
  );
}
