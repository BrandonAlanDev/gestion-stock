import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center gap-4 mt-12">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-neutral-100 hover:bg-cyan-50 text-neutral-600 hover:text-cyan-600 transition-colors"
        >
          ← Anterior
        </Link>
      )}
      <span className="flex items-center text-sm text-neutral-500 font-medium">
        Página {currentPage} de {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-neutral-100 hover:bg-cyan-50 text-neutral-600 hover:text-cyan-600 transition-colors"
        >
          Siguiente →
        </Link>
      )}
    </div>
  );
}