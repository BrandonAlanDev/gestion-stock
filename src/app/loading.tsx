import {ShoppingBasket} from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm transition-opacity">
      {/* Círculo*/}
      <div className="relative flex items-center justify-center">
        {/* Círculo exterior animado */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-amber-900 border-t-amber-300"></div>      
        {/* Un detalle*/}
        <div className="absolute text-2xl"><ShoppingBasket className="text-white"/></div>
      </div>
      <h2 className="mt-4 text-lg font-semibold animate-pulse">
        Cargando datos...
      </h2>
    </div>
  );
}