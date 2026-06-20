"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import ManageCategoryModal from "@/components/categories/modals/ManageCategoryModal";
import AddSubCategoryForm from "@/components/categories/forms/AddSubCategoryForm";
import DeleteSubBtn from "@/components/categories/modals/DeleteSubBtn";
import { Tag, Layers, FolderDot } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategories } from "@/actions/categories";
import { getSizeTypes } from "@/actions/sizes";

// --- UTILIDAD PARA CALCULAR EL CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function CategoriesAdminPage() {
  const pageConfig = usePageConfig();
  const [categories, setCategories] = useState<any[]>([]);
  const [sizeTypes, setSizeTypes] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Carga de datos del lado del cliente compartiendo la consistencia de estados
  useEffect(() => {
    Promise.all([getCategories(), getSizeTypes()]).then(([catData, sizeData]) => {
      setCategories(catData || []);
      setSizeTypes(sizeData || []);
      setMounted(true);
    });
  }, []);

  // Variables dinámicas de color
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad y contraste
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Estilos y bordes dinámicos basados en opacidad
  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const innerCardBg = isDarkBg ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
  const pageBackground = isDarkBg ? "#0f172a" : "#f8fafc";

  if (!mounted) return null;

  return (
    <div className="p-8 min-h-screen pt-24" style={{ backgroundColor: pageBackground, color: textColor }}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1
            className="text-3xl font-black uppercase italic flex items-center gap-3"
            style={{ color: textColor }}
          >
            <Tag style={{ color: primaryColor }} />
            Estructura de Catálogo
          </h1>
          <p
            className="text-[10px] font-black uppercase mt-1 opacity-50"
            style={{ color: textColor, letterSpacing: "0.4em" }}
          >
            Gestión de categorías y subgrupos
          </p>
        </div>
        <ManageCategoryModal sizeTypes={sizeTypes} />
      </div>

      {/* GRID DE CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div
            key={cat.id}
            className="flex flex-col relative border shadow-sm"
            style={{
              backgroundColor: secondaryColor,
              borderColor: overlayBorder,
              borderRadius: "2rem",
              padding: "1.5rem",
            }}
          >
            {/* Badge + edit */}
            <div className="flex justify-between items-start mb-4">
              <div
                className="flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase border"
                style={{
                  color: primaryColor,
                  backgroundColor: isDarkBg ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.03)",
                  borderColor: overlayBorder,
                  borderRadius: "8px",
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
              style={{ color: textColor }}
            >
              {cat.name}
            </h3>

            {/* Subcategorías */}
            <div className="flex-1 space-y-3">
              <h4
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60"
                style={{ color: textColor }}
              >
                <Layers size={12} /> Subcategorías Actuales
              </h4>

              <div className="space-y-2" style={{ minHeight: "50px" }}>
                {cat.subCategories?.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center p-3 border"
                    style={{
                      backgroundColor: innerCardBg,
                      borderColor: overlayBorder,
                      borderRadius: "14px",
                    }}
                  >
                    <div>
                      <p
                        className="text-xs font-bold uppercase"
                        style={{ color: textColor }}
                      >
                        {sub.name}
                      </p>
                      <p
                        className="text-[8px] font-black uppercase mt-0.5"
                        style={{ color: primaryColor }}
                      >
                        {sub.sizeType?.name || "Talle Único"}
                      </p>
                    </div>
                    <DeleteSubBtn id={sub.id} />
                  </div>
                ))}

                {(!cat.subCategories || cat.subCategories.length === 0) && (
                  <p className="text-[10px] italic px-1 opacity-40" style={{ color: textColor }}>
                    No hay subcategorías registradas.
                  </p>
                )}
              </div>
            </div>

            {/* Formulario agregar subcategoría */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${overlayBorder}` }}>
              <AddSubCategoryForm categoryId={cat.id} sizeTypes={sizeTypes} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}