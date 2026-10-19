import { CategoryCard } from "./CategoryCard"; // Asegúrate de exportarlo
import type { CategoriaTarjeta } from "./CategoryCard";

export default function LayoutGrid({ categories }: { categories: CategoriaTarjeta[] }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
      {categories.map((cat, index) => (
        <CategoryCard key={cat.id} cat={cat} index={index} />
      ))}
    </div>
  );
}
