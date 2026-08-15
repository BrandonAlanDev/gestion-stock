"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { SearchableSelectProps } from "@/components/admin/destination-picker/types";

export default function SearchableSelect({
  label,
  placeholder = "Buscar...",
  value,
  items,
  onChange,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const selected = items.find((i) => i.id === value);

  return (
    <div className="space-y-2">

      <label className="text-sm font-bold">
        {label}
      </label>

      <div className="rounded-xl border overflow-hidden">

        <div className="relative border-b">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full py-3 pl-10 pr-4 outline-none"
          />

        </div>

        <div className="max-h-64 overflow-y-auto">

          {filteredItems.length === 0 && (
            <div className="p-4 text-sm text-neutral-500">
              No se encontraron resultados
            </div>
          )}

          {filteredItems.map((item) => (

            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-neutral-100 transition"
            >

              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>

              {selected?.id === item.id && (
                <Check size={18} />
              )}

            </button>

          ))}

        </div>

      </div>

      {selected && (
        <div className="text-xs text-neutral-500">

          Seleccionado:

          <span className="font-semibold ml-1">

            {selected.label}

          </span>

        </div>
      )}

    </div>
  );
}