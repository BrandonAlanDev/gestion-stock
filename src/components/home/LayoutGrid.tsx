import { CategoryCard } from "./CategoryCard"; // Asegúrate de exportarlo
import type { CategoriaTarjeta } from "./CategoryCard";

export default function LayoutGrid({ categories }: { categories: CategoriaTarjeta[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat, index) => (
        <CategoryCard key={cat.id} cat={cat} index={index} />
      ))}
    </div>
  );
}
