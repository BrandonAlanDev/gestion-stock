import { CategoryCard } from "./CategoryCard"; // Asegúrate de exportarlo

export default function LayoutGrid({ categories, primaryColor }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {categories.map((cat: any, index: number) => (
        <CategoryCard key={cat.id} cat={cat} index={index} primaryColor={primaryColor} />
      ))}
    </div>
  );
}