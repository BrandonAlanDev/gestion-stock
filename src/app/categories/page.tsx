import { getCategories, deleteSubCategory } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import ManageCategoryModal from "@/components/garment/ManageCategoryModal";
import AddSubCategoryForm from "@/components/garment/AddSubCategoryForm"; // El que creamos arriba
import DeleteSubBtn from "@/components/garment/DeleteSubBtn"; // Opcional para borrar subs
import { Tag, Layers, FolderDot } from "lucide-react";

export const dynamic = "force-dynamic";

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
            Estructura de Catálogo
          </h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
            Gestión de categorías y subgrupos de NewSurfBoard
          </p>
        </div>
        <ManageCategoryModal sizeTypes={sizeTypes} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div 
            key={cat.id} 
            className="bg-neutral-900/30 border border-neutral-800/80 p-6 rounded-[2.5rem] flex flex-col group relative"
          >
            {/* Header: Categoría Madre */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[9px] font-black uppercase rounded-xl">
                <FolderDot size={12} />
                Categoría Principal
              </div>
              <ManageCategoryModal sizeTypes={sizeTypes} category={cat} />
            </div>

            <h3 className="text-2xl font-black text-white uppercase italic mb-6">
              {cat.name}
            </h3>

            {/* Listado de Subcategorías */}
            <div className="flex-1 space-y-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-neutral-600 flex items-center gap-2">
                <Layers size={12} /> Subcategorías Actuales
              </h4>

              <div className="space-y-2 min-h-[50px]">
                {cat.subCategories?.map((sub: any) => (
                  <div key={sub.id} className="bg-neutral-950/60 border border-neutral-800/50 p-3 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{sub.name}</p>
                      <p className="text-[8px] text-amber-500/70 font-black uppercase">
                        {sub.sizeType?.name || "Talle Único"}
                      </p>
                    </div>
                    {/* Botón para borrar subcategoría (puedes crearlo similar al de prendas) */}
                    <DeleteSubBtn id={sub.id} />
                  </div>
                ))}
                {(!cat.subCategories || cat.subCategories.length === 0) && (
                  <p className="text-[10px] text-neutral-700 italic">No hay subcategorías.</p>
                )}
              </div>
            </div>

            {/* FORMULARIO INTERNO: Agregar Subcategoría */}
            <AddSubCategoryForm categoryId={cat.id} sizeTypes={sizeTypes} />
          </div>
        ))}
      </div>
    </div>
  );
}