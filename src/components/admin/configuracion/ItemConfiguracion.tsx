import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Lock } from "lucide-react";

import Badge from "@/components/ui/badge";

interface ItemConfiguracionProps {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  varianteBadge?:
    | "activo"
    | "inactivo"
    | "oculto"
    | "sin-configurar"
    | "borrador"
    | "info";
  textoBadge?: string;
  proximamente?: boolean;
  href?: string;
  alClick?: () => void;
}

export default function ItemConfiguracion({
  icono: Icono,
  titulo,
  descripcion,
  varianteBadge,
  textoBadge,
  proximamente = false,
  href,
  alClick,
}: ItemConfiguracionProps) {
  const contenido = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--admin-fondo)] text-[var(--admin-texto-suave)]">
        <Icono size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-texto)]">{titulo}</p>
        {descripcion && (
          <p className="truncate text-xs text-[var(--admin-texto-suave)]">{descripcion}</p>
        )}
      </div>
      {proximamente ? (
        <Badge variante="inactivo">Próximamente</Badge>
      ) : (
        textoBadge && (
          <Badge variante={varianteBadge ?? "info"}>{textoBadge}</Badge>
        )
      )}
      {proximamente ? (
        <Lock size={14} className="shrink-0 text-[var(--admin-texto-suave)]" />
      ) : (
        <ChevronRight size={15} className="shrink-0 text-[var(--admin-texto-suave)]" />
      )}
    </>
  );

  if (proximamente) {
    return (
      <div className="pointer-events-none flex w-full items-center gap-3 px-4 py-3 opacity-50">
        {contenido}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--admin-fondo-hover)]"
      >
        {contenido}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={alClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer hover:bg-[var(--admin-fondo-hover)]"
    >
      {contenido}
    </button>
  );
}
