"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface SearchProps {
  className?: string;
}

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
    <div className={`relative flex flex-1 flex-shrink-0 ${className}`}>
      <input
        style={{
          background: "#ffffff",
          border: "1px solid #b2dede",
          color: "#0d2b2e",
          borderRadius: "8px",
          padding: "9px 12px 9px 38px",
          fontSize: "14px",
          width: "100%",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        placeholder="Buscar por nombre, SKU o categoría..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        onFocus={e => {
          e.currentTarget.style.borderColor = "#4ab8b8";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(74,184,184,0.15)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = "#b2dede";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "#4a7c80", fontSize: "14px", pointerEvents: "none" }}
      >
        🔍
      </span>
    </div>
  );
}