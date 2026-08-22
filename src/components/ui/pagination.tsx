import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  basePath,
  searchParams,
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const armarHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([clave, valor]) => {
      if (valor) params.set(clave, valor);
    });
    if (page > 1) params.set("page", String(page));
    const consulta = params.toString();
    return `${basePath || "?"}${consulta ? `?${consulta}` : ""}`;
  };

  const claseBoton =
    "cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="flex justify-center gap-4 mt-12">
      {basePath ? (
        <Link
          href={armarHref(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className={`${claseBoton} ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          ← Anterior
        </Link>
      ) : (
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className={claseBoton}
        >
          ← Anterior
        </button>
      )}
      <span>Página {currentPage} de {totalPages}</span>
      {basePath ? (
        <Link
          href={armarHref(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className={`${claseBoton} ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Siguiente →
        </Link>
      ) : (
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className={claseBoton}
        >
          Siguiente →
        </button>
      )}
    </div>
  );
}
