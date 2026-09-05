"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductsPaginationProps {
  pagina: number;
  totalPaginas: number;
  total: number;
  limite: number;
  alCambiarPagina: (pagina: number) => void;
}

function construirPaginas(pagina: number, totalPaginas: number): (number | "…")[] {
  if (totalPaginas <= 5) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const conjunto = new Set<number>([1, 2, pagina - 1, pagina, pagina + 1, totalPaginas - 1, totalPaginas]);

  const paginasOrdenadas: number[] = Array.from(conjunto)
    .filter((numero) => numero >= 1 && numero <= totalPaginas)
    .sort((a, b) => a - b);

  const resultado: (number | "…")[] = [];
  let anterior = 0;
  for (const numero of paginasOrdenadas) {
    if (numero - anterior > 1) resultado.push("…");
    resultado.push(numero);
    anterior = numero;
  }

  return resultado;
}

export default function ProductsPagination({
  pagina,
  totalPaginas,
  total,
  limite,
  alCambiarPagina,
}: ProductsPaginationProps) {
  if (totalPaginas <= 1) return null;

  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);
  const paginas = construirPaginas(pagina, totalPaginas);

  const claseBoton =
    "cursor-pointer rounded-lg border border-[var(--admin-borde)] h-9 min-w-9 px-2 text-sm font-medium transition hover:bg-[var(--admin-fondo-hover)] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--admin-borde)] py-4 sm:flex-row">
      <p className="text-sm text-[var(--admin-texto-suave)]">
        Mostrando {desde} a {hasta} de {total} productos
      </p>

      <nav className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina <= 1}
          onClick={() => alCambiarPagina(pagina - 1)}
          className={`${claseBoton} text-[var(--admin-texto)]`}
        >
          <ChevronLeft size={16} />
        </button>

        {paginas.map((item, indice) => {
          if (item === "…") {
            return (
              <span key={`elipsis-${indice}`} className="px-2 text-sm text-[var(--admin-texto-suave)]">
                …
              </span>
            );
          }

          const activa = item === pagina;
          return (
            <button
              key={item}
              type="button"
              aria-label={`Página ${item}`}
              aria-current={activa ? "page" : undefined}
              onClick={() => alCambiarPagina(item)}
              className={`${claseBoton} ${
                activa
                  ? "border-transparent bg-[var(--admin-primario)] text-[var(--admin-primario-texto)] hover:bg-[var(--admin-primario)]"
                  : "text-[var(--admin-texto)]"
              }`}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          aria-label="Página siguiente"
          disabled={pagina >= totalPaginas}
          onClick={() => alCambiarPagina(pagina + 1)}
          className={`${claseBoton} text-[var(--admin-texto)]`}
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
