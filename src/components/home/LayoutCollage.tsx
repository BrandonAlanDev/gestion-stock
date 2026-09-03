import { CategoryCard } from "./CategoryCard";
import type { CategoriaTarjeta } from "./CategoryCard";

export default function LayoutCollage({ categories }: { categories: CategoriaTarjeta[] }) {
  // Definimos los layouts de forma explícita. 
  // Nota: Asegúrate de que la suma de col-span en una fila nunca exceda 4.
  const getLayout = (i: number) => {
    const layouts = [
      "md:col-span-2 md:row-span-2", // 0: Grande
      "md:col-span-2 md:row-span-1", // 1: Ancha
      "md:col-span-1 md:row-span-1", // 2: Pequeña
      "md:col-span-1 md:row-span-1", // 3: Pequeña
      "md:col-span-1 md:row-span-2", // 4: Alta
      "md:col-span-1 md:row-span-1", // 5: Pequeña
      "md:col-span-2 md:row-span-1", // 6: Ancha
    ];
    return layouts[i % layouts.length];
  };

  return (
    /* 1. grid-flow-dense: ELIMINA LA SUPERPOSICIÓN automáticamente.
       2. auto-rows: Cambiamos de altura fija a una altura base mínima 
          para que no colapsen los elementos.
    */
    <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] grid-flow-dense gap-4 p-4">
      {categories.map((cat, i) => (
        <div key={cat.id} className={`${getLayout(i)} w-full h-full overflow-hidden`}>
          <CategoryCard 
            cat={cat} 
            index={i} 
            variant="collage" // ¡IMPORTANTE! Asegúrate de pasar la variante
          />
        </div>
      ))}
    </div>
  );
}
