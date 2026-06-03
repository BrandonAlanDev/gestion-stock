"use client";

import { Search as SearchIcon } from "lucide-react";
import { useRef } from "react";

interface SearchProps {
  initialValue?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Search({ initialValue = "", onChange, className }: SearchProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(value);
    }, 300);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7c80]" />
      <input
        type="text"
        placeholder="Buscar producto..."
        defaultValue={initialValue}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none"
        style={{
          background: "#ffffff",
          border: "1px solid #b2dede",
          color: "#0d2b2e",
        }}
      />
    </div>
  );
}