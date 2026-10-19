"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Globe, Eye } from "lucide-react";

import { obtenerPaginasPersonalizadas } from "@/actions/paginas-personalizadas/obtener-paginas";
import { crearPaginaPersonalizada } from "@/actions/paginas-personalizadas/crear-pagina";
import { eliminarPaginaPersonalizada } from "@/actions/paginas-personalizadas/eliminar-pagina";
import { actualizarContenidoPaginaPersonalizada } from "@/actions/paginas-personalizadas/actualizar-contenido-pagina";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { PageBuilderModal } from "@/components/admin/custom-page/Modals";
import DeleteConfirmModal from "@/components/admin/custom-page/DeleteConfirmModal";
import ViewPageModal from "@/components/admin/custom-page/ViewPageModal";
import { SkeletonFilas } from "@/components/ui/skeleton-vistas";

type PaginaCustomizada = Awaited<ReturnType<typeof obtenerPaginasPersonalizadas>>[number];
type DatosPagina = Parameters<typeof actualizarContenidoPaginaPersonalizada>[1] & {
  title: string;
  slug: string;
};

export default function CustomPagesPage() {
  const pageConfig = usePageConfig();

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#fff";

  const [pages, setPages] = useState<PaginaCustomizada[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPage, setSelectedPage] = useState<PaginaCustomizada | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    const data = await obtenerPaginasPersonalizadas();
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

  const handleOpenEdit = (page: PaginaCustomizada) => {
    setSelectedPage(page);
    setIsBuilderOpen(true);
  };

  const handleOpenView = (page: PaginaCustomizada) => {
    setSelectedPage(page);
    setIsViewerOpen(true);
  };

  const handleOpenDelete = (page: PaginaCustomizada) => {
    setSelectedPage(page);
    setIsDeleteOpen(true);
  };

  const handleSavePage = async (formData: DatosPagina) => {
    setIsProcessing(true);
    try {
      let pageId = selectedPage?.id;

      if (!pageId) {
        const newPage = await crearPaginaPersonalizada({
          title: formData.title,
          slug: formData.slug,
          subtitle: formData.subtitle,
          isActive: formData.isActive
        });
        pageId = newPage.id;
      }

      await actualizarContenidoPaginaPersonalizada(pageId, {
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
      await eliminarPaginaPersonalizada(selectedPage.id);
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
      <div className="mx-auto max-w-7xl px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
        <div className="space-y-6">

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1>Páginas</h1>
                <p className="mt-1 text-sm font-medium text-[var(--admin-texto-suave)]">
                  Creá y administrá las páginas de contenido de tu tienda.
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 rounded-md bg-[var(--admin-primario)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-primario-texto)] hover:opacity-90"
              >
                <Plus size={20} />
                Crear página
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-[var(--admin-fondo-opaco)]">
            {loading && <SkeletonFilas filas={5} />}
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col items-start justify-between gap-3 border-b border-[var(--admin-borde)] p-3 transition-colors last:border-b-0 hover:bg-[var(--admin-fondo-hover)] sm:flex-row sm:items-center"
              >
                {/* Izquierda: ícono + título + slug */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primario-suave)] sm:h-12 sm:w-12">
                    <Globe size={20} className="text-[var(--admin-primario)] sm:size-[22px]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold leading-tight text-[var(--admin-texto)] sm:text-lg">
                      {page.title}
                    </h3>
                    <p className="truncate text-sm text-[var(--admin-texto-suave)]">
                      {`/page/?title=${page.slug}    `}{"  •  "}{page.sections?.length || 0} secciones
                    </p>
                  </div>
                </div>

                {/* Derecha: estado + botones */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`rounded-[1rem] px-3 py-1 text-xs font-black tracking-wide ${page.isActive ? "bg-[var(--admin-exito-suave)] text-[var(--admin-exito)]" : "bg-[var(--admin-secundario-suave)] text-[var(--admin-texto-suave)]"}`}
                  >
                    {page.isActive ? "ACTIVA" : "INACTIVA"}
                  </span>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleOpenView(page)}
                      aria-label={`Ver estructura de ${page.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]"
                      title="Ver estructura"
                    >
                      <Eye size={16} className="sm:size-[18px]" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(page)}
                      aria-label={`Editar ${page.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]"
                      title="Editar constructor"
                    >
                      <Pencil size={16} className="sm:size-[18px]" />
                    </button>

                    <button
                      onClick={() => handleOpenDelete(page)}
                      aria-label={`Eliminar ${page.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-peligro-suave)] hover:text-[var(--admin-peligro)]"
                      title="Eliminar"
                    >
                      <Trash2 size={16} className="sm:size-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && pages.length === 0 && (
              <div className="flex flex-col items-center p-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]">
                  <Globe size={32} />
                </div>
                <h3 className="text-xl font-black text-[var(--admin-texto)]">No hay páginas dinámicas creadas</h3>
                <p className="mt-2 max-w-sm text-[var(--admin-texto-suave)]">
                  Utiliza el botón de &quot;Crear Página&quot; para comenzar a armar tu primera landing page modular.
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
      />

      <ViewPageModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        page={selectedPage}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
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
