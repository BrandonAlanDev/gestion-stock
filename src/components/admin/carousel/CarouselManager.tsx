"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, AlertTriangle, X, Edit } from "lucide-react";
import { getContrastColor } from "@/lib/utils";
import { createCarousel, updateCarousel, deleteCarousel, getCarousels, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide } from "@/actions/carousel/carousel.actions";
import { toast } from "sonner";
import type { Carousel, CarouselWizardData } from "@/types/carousel";
import CarouselWizard from "./CarouselWizard";
import SlideEditor from "./SlideEditor";

interface CarouselManagerProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function CarouselManager({ primaryColor, secondaryColor }: CarouselManagerProps) {
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
    setEditingCarousel(carousel);
    setShowWizard(true);
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
          return { ...c, slides: [...(c.slides || []), { ...res.data, isNew: false }] };
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
            Carruseles
          </h2>
          <p className="text-sm mt-1" style={{ color: textColor + "CC" }}>
            Gestiona carruseles tipo Hero, Banner rotativo y Grilla de Cards.
          </p>
        </div>
        <button
          onClick={handleAddCarousel}
          className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <Plus className="w-5 h-5" /> Nuevo carrusel
        </button>
      </div>

      {carousels.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: primaryColor + "40", backgroundColor: primaryColor + "10" }}>
          <ImageIcon className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor + "80" }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: textColor }}>No hay carruseles configurados</h3>
          <p className="mb-6" style={{ color: textColor + "99" }}>Crea tu primer carrusel para la home</p>
          <button
            onClick={handleAddCarousel}
            className="px-6 py-3 rounded-lg font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <Plus className="w-5 h-5" /> Crear carrusel
          </button>
        </div>
      ) : (
            <div className="space-y-4">
              {carousels.map((carousel, index) => (
                <CarouselItem
                  key={carousel.id}
                  carousel={carousel}
                  index={index}
                  onEditCarousel={handleEditCarousel}
                  onDelete={handleDeleteCarousel}
                  onAddSlide={handleAddSlide}
                  onEditSlide={handleEditSlide}
                  onDeleteSlide={handleDeleteSlide}
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
            linkType: (editingSlide.linkType as string) || "NONE",
            config: editingSlide.config as Record<string, unknown>,
          } : undefined}
          carouselType={editingSlideCarouselType}
          products={[]}
          categories={[]}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: secondaryColor, borderColor: primaryColor, color: getContrastColor(secondaryColor) }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
                <AlertTriangle className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: getContrastColor(secondaryColor) }}>Eliminar carrusel</h3>
            </div>
            <p className="mb-6" style={{ color: getContrastColor(secondaryColor) + "CC" }}>
              ¿Estás seguro de que quieres eliminar este carrusel y todos sus slides? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg font-medium transition-colors" style={{ backgroundColor: getContrastColor(primaryColor) + "1A", borderColor: primaryColor, color: primaryColor }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "30"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = getContrastColor(primaryColor) + "1A"; }}
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDeleteCarousel(deleteConfirm)}
                className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CarouselItemProps {
  carousel: Carousel;
  index: number;
  onEditCarousel: (carousel: Carousel) => void;
  onDelete: (id: string) => void;
  onAddSlide: (carousel: Carousel) => void;
  onEditSlide: (carousel: Carousel, slide: Record<string, unknown>) => void;
  onDeleteSlide: (carouselId: string, slideId: string) => void;
  primaryColor: string;
  secondaryColor: string;
}

function CarouselItem({
  carousel,
  index,
  onEditCarousel,
  onDelete,
  onAddSlide,
  onEditSlide,
  onDeleteSlide,
  primaryColor,
  secondaryColor,
}: CarouselItemProps) {
  const textColor = getContrastColor(secondaryColor);
  const [expanded, setExpanded] = useState(false);

  const slides = carousel.slides || [];

  return (
    <div
      style={{ backgroundColor: textColor + "08", borderColor: primaryColor + "30" }}
      className="rounded-2xl border"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm" style={{ color: textColor + "60" }}>#{index + 1}</span>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + "15" }}>
            <ImageIcon className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold" style={{ color: textColor }}>{carousel.title || `Carrusel ${carousel.type}`}</h4>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
                {carousel.type}
              </span>
              {carousel.active && <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: "#22c55e" + "20", color: "#22c55e" }}>Activo</span>}
            </div>
            <p className="text-sm flex items-center gap-2 mt-0.5" style={{ color: textColor + "80" }}>
              {slides.length} imágenes
              {carousel.settings?.height && <span>· {carousel.settings.height}px</span>}
              {carousel.type === "HERO" && carousel.settings?.slideLayout && <span>· {carousel.settings.slideLayout}</span>}
              {carousel.type === "CARDS" && carousel.settings?.layout && <span>· {carousel.settings.layout}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEditCarousel(carousel); }}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textColor + "80" }}
            title="Editar carrusel"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(carousel.id); }}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textColor + "80" }}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textColor + "80" }}
            title={expanded ? "Colapsar" : "Ver slides"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t" style={{ borderColor: primaryColor + "40" }}>
          <div className="p-4">
            <button
              onClick={(e) => { e.stopPropagation(); onAddSlide(carousel); }}
              className="w-full px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              style={{ borderColor: primaryColor + "40", color: primaryColor }}
            >
              <Plus className="w-4 h-4" /> Agregar slide
            </button>
          </div>

          <div className="px-4 pb-4 space-y-2">
            {slides.length === 0 && (
              <p className="text-center py-6 text-sm" style={{ color: textColor + "60" }}>
                Este carrusel no tiene slides todavía
              </p>
            )}
            {slides.map((slide, i) => (
              <div
                key={slide.id || i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: primaryColor + "08" }}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: textColor + "1A" }}>
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt={slide.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" style={{ color: textColor + "40" }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                    {slide.title || `Slide ${i + 1}`}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: textColor + "80" }}>
                    {slide.subtitle || "Sin subtítulo"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditSlide(carousel, slide as Record<string, unknown>); }}
                    className="p-1.5 rounded-lg"
                    style={{ color: textColor + "80" }}
                    title="Editar slide"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSlide(carousel.id, slide.id); }}
                    className="p-1.5 rounded-lg"
                    style={{ color: textColor + "80" }}
                    title="Eliminar slide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}