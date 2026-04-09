"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface CategoryFilterProps {
  categories: any[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("category", id);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative flex items-center">
      <Filter className="absolute left-3 text-neutral-500" size={16} />
      <select
        onChange={(e) => handleFilter(e.target.value)}
        value={searchParams.get("category") || ""}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-amber-500 appearance-none cursor-pointer uppercase font-bold tracking-widest"
      >
        <option value="">Todas las Categorías</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id} className="bg-neutral-950">
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}