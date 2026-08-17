import { getCategories } from "@/actions/categories";
import { getSizeTypes } from "@/actions/sizes";
import ManageCategoryModal from "@/components/categories/modals/ManageCategoryModal";
import AddSubCategoryForm from "@/components/categories/forms/AddSubCategoryForm";
import DeleteSubBtn from "@/components/categories/modals/DeleteSubBtn";
import { Tag, Layers, FolderDot } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const [categories, sizeTypes] = await Promise.all([
    getCategories(),
    getSizeTypes(),
  ]);

  return (
    <div className="p-8 min-h-screen pt-24" style={{ background: "var(--color-fondo-sitio)", color: "var(--texto-sobre-fondo)" }}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1
            className="text-3xl font-black uppercase italic flex items-center gap-3"
            style={{ color: "var(--texto-sobre-fondo)" }}
          >
            <Tag style={{ color: "var(--color-primario)" }} />
            Estructura de Catálogo
          </h1>
          <p
            className="text-[10px] font-black uppercase mt-1"
            style={{ color: "var(--texto-sobre-fondo)", opacity: 0.7, letterSpacing: "0.4em" }}
          >
            Gestión de categorías y subgrupos de NewSurfBoard
          </p>
        </div>
        <ManageCategoryModal sizeTypes={sizeTypes} />
      </div>

      {/* GRID DE CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div
            key={cat.id}
            className="flex flex-col relative"
            style={{
              background: "var(--color-secundario)",
              border: "1px solid var(--color-secundario)",
              borderRadius: "2.5rem",
              padding: "1.5rem",
            }}
          >
            {/* Badge + edit */}
            <div className="flex justify-between items-start mb-4">
              <div
                className="flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase"
                style={{
                  color: "var(--color-primario)",
                  background: "color-mix(in srgb, var(--color-primario) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-primario) 20%, transparent)",
                  borderRadius: "10px",
                }}
              >
                <FolderDot size={12} />
                Categoría Principal
              </div>
              <ManageCategoryModal sizeTypes={sizeTypes} category={cat} />
            </div>

            {/* Nombre categoría */}
            <h3
              className="text-2xl font-black uppercase italic mb-6"
              style={{ color: "var(--texto-sobre-secundario)" }}
            >
              {cat.name}
            </h3>

            {/* Subcategorías */}
            <div className="flex-1 space-y-3">
              <h4
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{ color: "var(--texto-sobre-secundario)", opacity: 0.7 }}
              >
                <Layers size={12} /> Subcategorías Actuales
              </h4>

              <div className="space-y-2" style={{ minHeight: "50px" }}>
                {cat.subCategories?.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center p-3"
                    style={{
                      background: "color-mix(in srgb, var(--color-primario) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--color-primario) 20%, transparent)",
                      borderRadius: "16px",
                    }}
                  >
                    <div>
                      <p
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--texto-sobre-secundario)" }}
                      >
                        {sub.name}
                      </p>
                      <p
                        className="text-[8px] font-black uppercase"
                        style={{ color: "var(--color-primario)" }}
                      >
                        {sub.sizeType?.name || "Talle Único"}
                      </p>
                    </div>
                    <DeleteSubBtn id={sub.id} />
                  </div>
                ))}

                {(!cat.subCategories || cat.subCategories.length === 0) && (
                  <p className="text-[10px] italic" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.5 }}>
                    No hay subcategorías.
                  </p>
                )}
              </div>
            </div>

            {/* Formulario agregar subcategoría */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-secundario)" }}>
              <AddSubCategoryForm categoryId={cat.id} sizeTypes={sizeTypes} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
