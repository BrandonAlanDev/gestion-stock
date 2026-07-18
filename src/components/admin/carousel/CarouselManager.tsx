"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, AlertTriangle, Settings } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { getContrastColor } from "@/lib/utils";
import { createCarousel, updateCarousel, deleteCarousel, getCarousels, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide } from "@/actions/carousel/carousel.actions";
import { getProductsPicker } from "@/actions/home-config/getProductsPicker";
import { getCategoriesPicker } from "@/actions/home-config/getCategoriesPicker";
import { toast } from "sonner";
import type { Carousel, CarouselWizardData, SlideWizardData } from "@/types/carousel";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

const LAYOUT_LABELS: Record<string, string> = {
  standard: "Estándar",
  split: "Dividido",
  minimal: "Minimalista",
  simple: "Simple",
  offers: "Ofertas",
};
import CarouselWizard from "./CarouselWizard";
import SlideEditor from "./SlideEditor";
import { SortableSlideItem } from "./CarouselWizardStep3";
import CarouselSettingsModal from "./CarouselSettingsModal";
import CarouselDesignModal from "./CarouselDesignModal";

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
  const [pickerProducts, setPickerProducts] = useState<{ id: string; name: string }[]>([]);
  const [pickerCategories, setPickerCategories] = useState<{ id: string; name: string }[]>([]);

  const [settingsModalCarousel, setSettingsModalCarousel] = useState<Carousel | null>(null);
  const [designModalCarousel, setDesignModalCarousel] = useState<Carousel | null>(null);

  useEffect(() => {
    loadCarousels();
    loadPickers();
  }, []);

  const loadPickers = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProductsPicker(),
        getCategoriesPicker(),
      ]);
      setPickerProducts(productsData.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
      setPickerCategories(categoriesData.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    } catch {
      console.error("Error loading picker data");
    }
  };

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

  const handleReorderSlides = async (carouselId: string, reordered: SlideWizardData[]) => {
    setCarousels((prev) =>
      prev.map((c) => {
        if (c.id !== carouselId) return c;
        return { ...c, slides: reordered.map((s) => ({ ...c.slides?.find((cs) => cs.id === s.id), ...s, order: s.order })) };
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
            className="px-6 py-3 rounded-lg font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
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
          products={pickerProducts}
          categories={pickerCategories}
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
                className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
                style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "0A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDeleteCarousel(deleteConfirm)}
                className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
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
  onEditDesign: (carousel: Carousel) => void;
  onDelete: (id: string) => void;
  onAddSlide: (carousel: Carousel) => void;
  onEditSlide: (carousel: Carousel, slide: Record<string, unknown>) => void;
  onDeleteSlide: (carouselId: string, slideId: string) => void;
  onReorderSlides: (carouselId: string, slides: SlideWizardData[]) => void;
  primaryColor: string;
  secondaryColor: string;
}

function CarouselItem({
  carousel,
  index,
  onEditCarousel,
  onEditDesign,
  onDelete,
  onAddSlide,
  onEditSlide,
  onDeleteSlide,
  onReorderSlides,
  primaryColor,
  secondaryColor,
}: CarouselItemProps) {
  const textColor = getContrastColor(secondaryColor);
  const [expanded, setExpanded] = useState(false);

  const slides = carousel.slides || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const mapToWizardData = (s: typeof slides[number]): SlideWizardData => ({
    id: s.id,
    image: s.image || "",
    title: s.title || "",
    subtitle: s.subtitle || "",
    description: s.description || "",
    ctaText: s.ctaText || "",
    url: s.url || "",
    order: s.order,
    config: s.config || {},
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over?.id);
      const newSlides = arrayMove(slides.map(mapToWizardData), oldIndex, newIndex);
      const reordered = newSlides.map((s, i) => ({ ...s, order: i }));
      onReorderSlides(carousel.id, reordered);
    }
  };

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
              <h4 className="font-semibold" style={{ color: textColor }}>{carousel.title || TYPE_LABELS[carousel.type] || carousel.type}</h4>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
                {TYPE_LABELS[carousel.type] || carousel.type}
              </span>
              {carousel.active && <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: "#22c55e" + "20", color: "#22c55e" }}>Activo</span>}
            </div>
            <p className="text-sm flex items-center gap-2 mt-0.5" style={{ color: textColor + "80" }}>
              {slides.length} imágenes
              {carousel.settings?.height && <span>· {carousel.settings.height}px</span>}
              {carousel.type === "HERO" && carousel.settings?.slideLayout && <span>· {LAYOUT_LABELS[carousel.settings.slideLayout as string] || carousel.settings.slideLayout}</span>}
              {carousel.type === "CARDS" && carousel.settings?.layout && <span>· {LAYOUT_LABELS[carousel.settings.layout as string] || carousel.settings.layout}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEditCarousel(carousel); }}
            className="px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: primaryColor + "20", color: primaryColor, border: "1px solid", borderColor: primaryColor + "30" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "20"; }}
            title="Configuración del carrusel"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "80" }}
            title={expanded ? "Colapsar" : "Ver slides"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(carousel.id); }}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "80" }}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t" style={{ borderColor: primaryColor + "40" }}>
          <div className="p-4 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEditDesign(carousel); }}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor + "15", color: primaryColor, border: "1px solid", borderColor: primaryColor + "30" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "25"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "15"; }}
            >
              Cambiar diseño
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAddSlide(carousel); }}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ borderColor: primaryColor + "40", color: primaryColor }}
            >
              <Plus className="w-4 h-4" /> Agregar imagen
            </button>
          </div>

          <div className="px-4 pb-4">
            {slides.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: textColor + "60" }}>
                Este carrusel no tiene slides todavía
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {slides.map((slide) => (
                      <SortableSlideItem
                        key={slide.id}
                        slide={mapToWizardData(slide)}
                        onEdit={() => onEditSlide(carousel, slide as Record<string, unknown>)}
                        onDelete={(id) => onDeleteSlide(carousel.id, id)}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}
    </div>
  );
}