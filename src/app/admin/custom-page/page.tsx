"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Globe, Eye, Settings } from "lucide-react";

import {
  getCustomPages,
  createCustomPage,
  deleteCustomPage,
  updateCustomPageContent,
} from "@/actions/custom-page.actions";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { DeleteConfirmModal, ViewPageModal, PageBuilderModal } from "@/components/admin/custom-page/Modals";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function CustomPagesPage() {
  const pageConfig = usePageConfig();

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#fff";
  const contrastColor = getContrastColor(primaryColor);

  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    const data = await getCustomPages();
    setPages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleOpenCreate = () => {
    setSelectedPage(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (page: any) => {
    setSelectedPage(page);
    setIsBuilderOpen(true);
  };

  const handleOpenView = (page: any) => {
    setSelectedPage(page);
    setIsViewerOpen(true);
  };

  const handleOpenDelete = (page: any) => {
    setSelectedPage(page);
    setIsDeleteOpen(true);
  };

  const handleSavePage = async (formData: any) => {
    setIsProcessing(true);
    try {
      let pageId = selectedPage?.id;

      if (!pageId) {
        const newPage = await createCustomPage({
          title: formData.title,
          slug: formData.slug,
          subtitle: formData.subtitle,
          isActive: formData.isActive
        });
        pageId = newPage.id;
      }

      await updateCustomPageContent(pageId, {
        title: formData.title,
        slug: formData.slug,
        subtitle: formData.subtitle,
        isActive: formData.isActive,
        sections: formData.sections
      });

      await loadPages();
      setIsBuilderOpen(false);
    } catch (error) {
      console.error("Error al guardar página:", error);
      alert("Ocurrió un error al guardar la página.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPage) return;
    setIsProcessing(true);
    try {
      await deleteCustomPage(selectedPage.id);
      await loadPages();
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div

        className="p-6 sm:p-8 w-full transition-colors duration-200 min-h-screen"
        style={{ backgroundColor: secondaryColor }}
      >
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="rounded-[1.0rem] border backdrop-blur-xl p-6 bg-white/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-row gap-2 items-center">
                  <span style={{ color: primaryColor }}><Settings size={28} /></span>
                  <h1 className="font-black text-3xl text-black">Páginas Dinámicas</h1>
                </div>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Gestiona el contenido estructurado de las landing pages.
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-6 py-3 rounded-[1.0rem] font-bold transition-transform active:scale-95 shadow-md hover:opacity-90"
                style={{ backgroundColor: primaryColor, color: contrastColor }}
              >
                <Plus size={20} />
                Crear Página
              </button>
            </div>
          </div>
          <div className="rounded-[1.0rem] border bg-white overflow-hidden shadow-sm">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors gap-3"
              >
                {/* Izquierda: ícono + título + slug */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1.0rem] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Globe size={20} color={primaryColor} className="sm:size-[22px]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight truncate">
                      {page.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 mt-0.5">
                      /{page.slug} • {page.sections?.length || 0} secciones
                    </p>
                  </div>
                </div>

                {/* Derecha: estado + botones */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className="px-3 py-1 rounded-[1.0rem] text-xs font-black tracking-wide"
                    style={{
                      backgroundColor: page.isActive ? "#22c55e20" : "#ef444420",
                      color: page.isActive ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {page.isActive ? "ACTIVA" : "INACTIVA"}
                  </span>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleOpenView(page)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-[1.0rem] flex items-center justify-center text-gray-500 transition-colors border border-transparent"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                        e.currentTarget.style.color = primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }}
                      title="Ver estructura"
                    >
                      <Eye size={16} className="sm:size-[18px]" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(page)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-[1.0rem] flex items-center justify-center text-gray-500 transition-colors border border-transparent"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                        e.currentTarget.style.color = primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }}
                      title="Editar constructor"
                    >
                      <Pencil size={16} className="sm:size-[18px]" />
                    </button>

                    <button
                      onClick={() => handleOpenDelete(page)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-[1.0rem] flex items-center justify-center text-gray-500 transition-colors border border-transparent"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef444420';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} className="sm:size-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && pages.length === 0 && (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-[1.0rem] flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <Globe size={32} />
                </div>
                <h3 className="font-black text-xl text-gray-700">No hay páginas dinámicas creadas</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Utiliza el botón de "Crear Página" para comenzar a armar tu primera landing page modular.
                </p>
              </div>
            )}
          </div>
        </div>
      </div >

      <PageBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialData={selectedPage}
        onSave={handleSavePage}
        isSaving={isProcessing}
        primaryColor={primaryColor}
        contrastColor={contrastColor}
      />

      <ViewPageModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        page={selectedPage}
        primaryColor={primaryColor}
        contrastColor={contrastColor}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedPage?.title}
        isDeleting={isProcessing}
      />
    </>
  );
}