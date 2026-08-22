import { CategoryCard } from "./CategoryCard";

export default function LayoutMinimal({ categories, primaryColor }: any) {
  return (
    /* 1. grid-cols-1 md:grid-cols-2 lg:grid-cols-4: 
          Es responsive y se ve limpio.
       2. gap-6: Más espacio (aire) que en el collage.
    */
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8">
      {categories.map((cat: any, i: number) => (
        // Quitamos la altura fija del div contenedor. 
        // Dejamos que la tarjeta tome el alto que definamos en la variante.
        <div key={cat.id} className="w-full">
          <CategoryCard 
            cat={cat} 
            index={i} 
            primaryColor={primaryColor} 
            variant="minimal" // Usaremos esta variante
          />
        </div>
      ))}
    </div>
  );
}