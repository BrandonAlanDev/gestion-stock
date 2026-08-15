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
        className="..."
      >
        ← Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="..."
      >
        Siguiente →
      </button>
    </div>
  );
}