"use client";

import { Search as SearchIcon } from "lucide-react";
import { useRef } from "react";

interface SearchProps {
  initialValue?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Search({ initialValue = "", onChange, className }: SearchProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Diseños basados en la superficie
  const overlayBorder = "color-mix(in srgb, var(--texto-sobre-secundario) 12%, transparent)";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(value);
    }, 300);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <SearchIcon 
        size={16} 
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 transition-opacity" 
        style={{ color: "var(--texto-sobre-secundario)" }}
      />
      <input
        type="text"
        placeholder="Buscar producto..."
        defaultValue={initialValue}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none"
        style={{
          backgroundColor: "var(--color-secundario)",
          border: `1px solid ${overlayBorder}`,
          color: "var(--texto-sobre-secundario)",
        }}
      />
    </div>
  );
}
