"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

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
  const paleta = useAdminPaleta();

  if (totalPaginas <= 1) return null;

  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);
  const paginas = construirPaginas(pagina, totalPaginas);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t py-4 sm:flex-row" style={{ borderColor: paleta.borde }}>
      <p className="text-sm" style={{ color: paleta.textoSuave }}>
        Mostrando {desde} a {hasta} de {total} productos
      </p>

      <nav className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina <= 1}
          onClick={() => alCambiarPagina(pagina - 1)}
          className="cursor-pointer rounded-lg h-9 min-w-9 px-2 text-sm font-medium transition-colors disabled:opacity-40"
          style={{ border: `1px solid ${paleta.borde}`, color: paleta.texto }}
        >
          <ChevronLeft size={16} />
        </button>

        {paginas.map((item, indice) => {
          if (item === "…") {
            return (
              <span key={`elipsis-${indice}`} className="px-2 text-sm" style={{ color: paleta.textoSuave }}>
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
              className="cursor-pointer rounded-lg h-9 min-w-9 px-2 text-sm font-medium transition-colors disabled:opacity-40"
              style={{
                border: `1px solid ${paleta.borde}`,
                backgroundColor: activa ? paleta.primario : "transparent",
                color: activa ? paleta.sobrePrimario : paleta.texto,
              }}
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
          className="cursor-pointer rounded-lg h-9 min-w-9 px-2 text-sm font-medium transition-colors disabled:opacity-40"
          style={{ border: `1px solid ${paleta.borde}`, color: paleta.texto }}
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
