"use client";

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string }>;
  value: string;
  onChange: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
      style={{
        background: "#ffffff",
        border: "1px solid #b2dede",
        color: "#0d2b2e",
        cursor: "pointer",
      }}
    >
      <option value="">Todas las categorías</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}