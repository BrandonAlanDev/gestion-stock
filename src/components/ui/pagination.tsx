interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-4 mt-12">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        ← Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        Siguiente →
      </button>
    </div>
  );
}