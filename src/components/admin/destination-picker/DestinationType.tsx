"use client";

import { DestinationType as TDestinationType } from "@/components/admin/destination-picker/types";

interface Props {
  value: TDestinationType;
  onChange: (value: TDestinationType) => void;
}

const options = [
  {
    value: "none",
    label: "Sin destino",
  },
  {
    value: "category",
    label: "Categoría",
  },
  {
    value: "product",
    label: "Producto",
  },
  {
    value: "page",
    label: "Página",
  },
  {
    value: "external",
    label: "URL externa",
  },
] as const;

export default function DestinationType({
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">

      <label className="block text-sm font-semibold">
        Destino
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as TDestinationType)
        }
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-black"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
}