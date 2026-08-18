import Link from "next/link";
import type { ReactNode } from "react";

import Badge from "@/components/ui/badge";

interface ConfigPaginas {
  escuelaEnabled: boolean;
  arreglosEnabled: boolean;
  personalizadoEnabled: boolean;
}

interface PaginaResumen {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
}

interface PropsPaginas {
  config: ConfigPaginas | null;
  paginas: PaginaResumen[];
}

export default function BloquePaginas({ config, paginas }: PropsPaginas) {
  function FilaPagina({
    etiqueta,
    href,
    externo,
    badge,
  }: {
    etiqueta: string;
    href: string;
    externo?: boolean;
    badge: ReactNode;
  }) {
    return (
      <div className="flex items-center justify-between gap-3">
        <Link
          href={href}
          target={externo ? "_blank" : undefined}
          className="text-xs text-[var(--admin-texto)] hover:underline"
        >
          {etiqueta}
        </Link>
        {badge}
      </div>
    );
  }

  if (!config) {
    return <p className="text-sm text-[var(--admin-texto-suave)]">No se pudo cargar</p>;
  }

  return (
    <>
      <FilaPagina
        etiqueta="Inicio"
        href="/"
        badge={<Badge variante="activo">Activa</Badge>}
      />
      <FilaPagina
        etiqueta="Catálogo"
        href="/productos"
        badge={<Badge variante="activo">Activa</Badge>}
      />
      {config.escuelaEnabled && (
        <FilaPagina
          etiqueta="Escuela"
          href="/escuela"
          badge={<Badge variante="activo">Activa</Badge>}
        />
      )}
      {config.arreglosEnabled && (
        <FilaPagina
          etiqueta="Arreglos"
          href="/arreglos"
          badge={<Badge variante="activo">Activa</Badge>}
        />
      )}
      {config.personalizadoEnabled && (
        <FilaPagina
          etiqueta="Personalizado"
          href="/personalizado"
          badge={<Badge variante="activo">Activa</Badge>}
        />
      )}
      {paginas.slice(0, 6).map((pagina) => (
        <FilaPagina
          key={pagina.id}
          etiqueta={pagina.title}
          href={`/page?title=${pagina.slug}`}
          externo
          badge={
            <Badge variante={pagina.isActive ? "activo" : "inactivo"}>
              {pagina.isActive ? "Activa" : "Inactiva"}
            </Badge>
          }
        />
      ))}
      {paginas.length > 6 && (
        <Link
          href="/admin/custom-page"
          className="text-xs text-[var(--admin-primario)] hover:underline"
        >
          +{paginas.length - 6} más
        </Link>
      )}
      {paginas.length === 0 && (
        <p className="text-xs text-[var(--admin-texto-suave)]">Sin páginas dinámicas</p>
      )}
    </>
  );
}
