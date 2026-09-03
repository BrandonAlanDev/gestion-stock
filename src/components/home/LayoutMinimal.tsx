import { CategoryCard } from "./CategoryCard";
import type { CategoriaTarjeta } from "./CategoryCard";

export default function LayoutMinimal({ categories }: { categories: CategoriaTarjeta[] }) {
  return (
    /* 1. grid-cols-1 md:grid-cols-2 lg:grid-cols-4: 
          Es responsive y se ve limpio.
       2. gap-6: Más espacio (aire) que en el collage.
    */
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8">
      {categories.map((cat, i) => (
        // Quitamos la altura fija del div contenedor. 
        // Dejamos que la tarjeta tome el alto que definamos en la variante.
        <div key={cat.id} className="w-full">
          <CategoryCard 
            cat={cat} 
            index={i} 
            variant="minimal" // Usaremos esta variante
          />
        </div>
      ))}
    </div>
  );
}
