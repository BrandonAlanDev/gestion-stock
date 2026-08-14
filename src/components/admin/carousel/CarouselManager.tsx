"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { getContrastColor } from "@/lib/utils";
import { createCarousel, updateCarousel, deleteCarousel, getCarousels, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide } from "@/actions/carousel/carousel.actions";
import { toast } from "sonner";
import type { Carousel, CarouselSlide, CarouselWizardData, SlideWizardData } from "@/types/carousel";
import CarouselWizard from "./CarouselWizard";
import SlideEditor from "./SlideEditor";
import type { SlideFormData } from "./SlideEditor";
import CarouselSettingsModal from "./CarouselSettingsModal";
import CarouselDesignModal from "./CarouselDesignModal";
import ElementoCarrusel from "./ElementoCarrusel";
import ConfirmacionEliminarSeccion from "./ConfirmacionEliminarSeccion";

interface CarouselManagerProps {
  primaryColor: string;
  secondaryColor: string;
  onCarouselsChange?: (carousels: Carousel[]) => void;
}

export default function CarouselManager({ primaryColor, secondaryColor, onCarouselsChange }: CarouselManagerProps) {
  const textColor = getContrastColor(secondaryColor);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<Carousel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [slideEditorOpen, setSlideEditorOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Record<string, unknown> | null>(null);
  const [editingSlideCarouselId, setEditingSlideCarouselId] = useState<string | null>(null);
  const [editingSlideCarouselType, setEditingSlideCarouselType] = useState<"HERO" | "BANNER" | "CARDS">("HERO");

  const [settingsModalCarousel, setSettingsModalCarousel] = useState<Carousel | null>(null);
  const [designModalCarousel, setDesignModalCarousel] = useState<Carousel | null>(null);

  useEffect(() => {
    if (isLoading) return;
    onCarouselsChange?.(carousels);
  }, [carousels, isLoading, onCarouselsChange]);

  useEffect(() => {
    loadCarousels();
  }, []);

  const loadCarousels = async () => {
    try {
      const res = await getCarousels();
      if (res.success && res.data) {
        setCarousels((res.data as Carousel[]).sort((a, b) => a.order - b.order));
      }
    } catch (error: unknown) {
      console.error("Error loading carousels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCarousel = () => {
    setEditingCarousel(null);
    setShowWizard(true);
  };

  const handleEditCarousel = (carousel: Carousel) => {
    setSettingsModalCarousel(carousel);
  };

  const handleEditDesign = (carousel: Carousel) => {
    setDesignModalCarousel(carousel);
  };

  const handleSaveWizard = async (wizardData: CarouselWizardData) => {
    try {
      if (wizardData.id) {
        const res = await updateCarousel(wizardData);
        if (res.success && res.data) {
          const updated = res.data as Carousel;
          setCarousels((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          toast.success("Carrusel actualizado");
        } else {
          toast.error(res.error);
          return;
        }
      } else {
        const res = await createCarousel(wizardData);
        if (res.success && res.data) {
          const created = res.data as Carousel;
          setCarousels([...carousels, created]);
          toast.success("Carrusel creado");
        } else {
          toast.error(res.error);
          return;
        }
      }
      setShowWizard(false);
    } catch (error: unknown) {
      console.error("Error saving carousel:", error);
      toast.error("Error al guardar");
    }
  };

  const handleDeleteCarousel = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDeleteCarousel = async (id: string) => {
    setDeleteConfirm(null);
    try {
      const res = await deleteCarousel(id);
      if (res.success) {
        setCarousels(carousels.filter((c) => c.id !== id));
        toast.success("Carrusel eliminado");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleAddSlide = (carousel: Carousel) => {
    setEditingSlide(null);
    setEditingSlideCarouselId(carousel.id);
    setEditingSlideCarouselType(carousel.type);
    setSlideEditorOpen(true);
  };

  const handleEditSlide = (carousel: Carousel, slide: Record<string, unknown>) => {
    setEditingSlide(slide);
    setEditingSlideCarouselId(carousel.id);
    setEditingSlideCarouselType(carousel.type);
    setSlideEditorOpen(true);
  };

  const handleSlideSave = useCallback(async (data: SlideFormData): Promise<void> => {
    const carouselId = editingSlideCarouselId;
    if (!carouselId) return;

    if (editingSlide?.id && typeof editingSlide.id === "string") {
      const res = await updateCarouselSlide(editingSlide.id, {
        ...data,
        order: (editingSlide.order as number) ?? 0,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setCarousels((prev) =>
        prev.map((c) => {
          if (c.id !== carouselId) return c;
          return {
            ...c,
            slides: (c.slides || []).map((s) =>
              s.id === editingSlide.id ? { ...s, ...data } : s
            ),
          };
        })
      );
      toast.success("Slide actualizado");
    } else {
      const order = (carousels.find((c) => c.id === carouselId)?.slides?.length ?? 0);
      const res = await addCarouselSlide(carouselId, { ...data, order });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setCarousels((prev) =>
        prev.map((c) => {
          if (c.id !== carouselId) return c;
          return { ...c, slides: [...(c.slides || []), { ...res.data, isNew: false } as unknown as CarouselSlide] };
        })
      );
      toast.success("Slide agregado");
    }
  }, [editingSlide, editingSlideCarouselId, carousels]);

  const handleDeleteSlide = async (carouselId: string, slideId: string) => {
    setCarousels((prev) =>
      prev.map((c) => {
        if (c.id !== carouselId) return c;
        return { ...c, slides: (c.slides || []).filter((s) => s.id !== slideId) };
      })
    );

    try {
      const res = await deleteCarouselSlide(slideId, carouselId);
      if (!res.success) {
        toast.error(res.error);
        loadCarousels();
      } else {
        toast.success("Slide eliminado");
      }
    } catch {
      toast.error("Error al eliminar slide");
      loadCarousels();
    }
  };

  const handleReorderSlides = async (carouselId: string, reordered: SlideWizardData[]) => {
    setCarousels((prev) =>
      prev.map((c) => {
        if (c.id !== carouselId) return c;
        return { ...c, slides: reordered.map((s) => ({ ...c.slides?.find((cs) => cs.id === s.id), ...s, order: s.order } as unknown as CarouselSlide)) };
      })
    );
    for (const slide of reordered) {
      if (!slide.id.startsWith("temp-")) {
        await updateCarouselSlide(slide.id, { order: slide.order });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ color: textColor }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: textColor }}>
            <ImageIcon className="w-6 h-6" style={{ color: primaryColor }} />
            Contenido Dinámico
          </h2>
          <p className="text-sm mt-1" style={{ color: textColor + "CC" }}>
            Administra las secciones visuales de la página principal.
          </p>
        </div>
        <button
          onClick={handleAddCarousel}
          className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <Plus className="w-5 h-5" /> Nueva sección
        </button>
      </div>

      {carousels.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: primaryColor + "40", backgroundColor: primaryColor + "10" }}>
          <ImageIcon className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor + "80" }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: textColor }}>No hay secciones configuradas</h3>
          <p className="mb-6" style={{ color: textColor + "99" }}>Crea tu primera sección para la home</p>
          <button
            onClick={handleAddCarousel}
            className="px-6 py-3 rounded-lg font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <Plus className="w-5 h-5" /> Crear sección
          </button>
        </div>
      ) : (
            <div className="space-y-4">
              {carousels.map((carousel, index) => (
                <ElementoCarrusel
                  key={carousel.id}
                  carousel={carousel}
                  index={index}
                  onEditCarousel={handleEditCarousel}
                  onEditDesign={handleEditDesign}
                  onDelete={handleDeleteCarousel}
                  onAddSlide={handleAddSlide}
                  onEditSlide={handleEditSlide}
                  onDeleteSlide={handleDeleteSlide}
                  onReorderSlides={handleReorderSlides}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ))}
            </div>
      )}

      <CarouselWizard
        isOpen={showWizard}
        onClose={() => { setShowWizard(false); setEditingCarousel(null); }}
        onSave={handleSaveWizard}
        initialData={editingCarousel ? {
          id: editingCarousel.id,
          type: editingCarousel.type,
          title: editingCarousel.title || "",
          settings: editingCarousel.settings || {},
          slides: (editingCarousel.slides || []).map((s) => ({
            id: s.id,
            image: s.image || "",
            title: s.title || "",
            subtitle: s.subtitle || "",
            description: s.description || "",
            ctaText: s.ctaText || "",
            url: s.url || "",
            order: s.order,
            isNew: false,
            linkType: (s.config?.linkType as string) || "",
          })),
        } : null}
      />

      {slideEditorOpen && (
        <SlideEditor
          isOpen={slideEditorOpen}
          onClose={() => { setSlideEditorOpen(false); setEditingSlide(null); }}
          onSave={handleSlideSave}
          initialData={editingSlide ? {
            image: editingSlide.image as string,
            title: editingSlide.title as string,
            subtitle: editingSlide.subtitle as string,
            description: editingSlide.description as string,
            ctaText: editingSlide.ctaText as string,
            url: editingSlide.url as string,
            linkType: (((editingSlide.config as Record<string, unknown> | null | undefined))?.linkType as string) || (((editingSlide.url as string) || "").startsWith("http") ? "EXTERNAL" : "NONE"),
            config: editingSlide.config as Record<string, unknown>,
          } : undefined}
          carouselType={editingSlideCarouselType}
        />
      )}

      {settingsModalCarousel && (
        <CarouselSettingsModal
          isOpen={!!settingsModalCarousel}
          onClose={() => setSettingsModalCarousel(null)}
          carousel={settingsModalCarousel}
          onSave={(updated) => setCarousels((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
        />
      )}

      {designModalCarousel && (
        <CarouselDesignModal
          isOpen={!!designModalCarousel}
          onClose={() => setDesignModalCarousel(null)}
          carousel={designModalCarousel}
          onSave={(updated) => setCarousels((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
        />
      )}

      {deleteConfirm && (
        <ConfirmacionEliminarSeccion
          onCancelar={() => setDeleteConfirm(null)}
          onConfirmar={() => confirmDeleteCarousel(deleteConfirm)}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </div>
  );
}
