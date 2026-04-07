"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search() {
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
    <div className="relative flex flex-1 flex-shrink-0">
      <input
        className="peer block w-full rounded-md border border-neutral-800 bg-neutral-900 py-[9px] pl-10 text-sm outline-none placeholder:text-neutral-500 focus:border-blue-500"
        placeholder="Buscar por nombre, SKU o categoría..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
    </div>
  );
}