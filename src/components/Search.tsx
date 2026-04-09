"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

// 1. Definimos la interfaz para que acepte className
interface SearchProps {
  className?: string;
}

// 2. Recibimos la prop className
export default function Search({ className }: SearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    // 3. Aplicamos la prop className al contenedor principal
    <div className={`relative flex flex-1 flex-shrink-0 ${className}`}>
      <input
        className="peer block w-full rounded-md border border-neutral-800 bg-neutral-900 py-[9px] pl-10 text-sm outline-none placeholder:text-neutral-500 focus:border-blue-500 text-white"
        placeholder="Buscar por nombre, SKU o categoría..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
        🔍
      </span>
    </div>
  );
}