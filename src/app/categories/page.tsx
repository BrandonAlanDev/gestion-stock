import { getCategories } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import ManageCategoryModal from "@/components/garment/ManageCategoryModal"; // El modal que permite editar
import { Tag, layers } from "lucide-react";

export default async function CategoriesAdminPage() {
  const [categories, sizeTypes] = await Promise.all([
    getCategories(),
    getSizeTypes(),
  ]);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 pt-24">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
            <Tag className="text-amber-500" />
            Categorías
          </h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
            Configuración de grupos y talles asociados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat: any) => (
          <div key={cat.id} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2.5rem] hover:border-neutral-700 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Botón para editar (pasando la data de la categoría) */}
              <ManageCategoryModal sizeTypes={sizeTypes} category={cat} />
            </div>

            <div className="mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                {cat.sizeType?.name || "Sin Talles"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter mb-1">
              {cat.name}
            </h3>
            <p className="text-neutral-500 text-[11px] font-medium leading-relaxed mb-6">
              {cat.description || "Sin descripción."}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {cat.sizeType?.sizes?.map((s: any) => (
                <span key={s.id} className="px-2 py-0.5 rounded-md bg-black border border-neutral-800 text-[9px] font-bold text-neutral-400">
                  {s.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}