"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Grid2X2,
  MapPin,
  GripVertical,
  Megaphone,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getContrastColor } from "@/lib/utils";
import { updateSectionOrder } from "@/actions/page-config/order.actions";
import { toast } from "sonner";
import type { Carousel } from "@/types/carousel";

interface Props {
  config: Record<string, unknown>;
  primaryColor: string;
  secondaryColor: string;
  carousels?: Carousel[] | null;
}

const CAROUSEL_ICONS: Record<string, React.ElementType> = {
  HERO: LayoutDashboard,
  BANNER: Megaphone,
  CARDS: ImageIcon,
};

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

const FIXED_SECTIONS: Record<string, { label: string; icon: React.ElementType; desc: string }> = {
  featured: { label: "Sección destacada", icon: Grid2X2, desc: "Sección destacada con grids" },
  location: { label: "Ubicación", icon: MapPin, desc: "Mapa y dirección" },
};

const CAROUSEL_PREFIX = "carousel_";

function isCarouselId(id: string) {
  return id.startsWith(CAROUSEL_PREFIX);
}

function getCarouselId(id: string) {
  return id.slice(CAROUSEL_PREFIX.length);
}

function SortableSection({
  id,
  label,
  icon: Icon,
  desc,
  primaryColor,
  secondaryColor,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  desc: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  const textColor = getContrastColor(secondaryColor);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: textColor + "08",
        borderColor: primaryColor + "30",
      }}
      className="rounded-xl border p-4 flex items-center gap-4"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" style={{ color: textColor + "50" }} />
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + "15" }}>
        <Icon className="w-5 h-5" style={{ color: primaryColor }} />
      </div>
      <div className="flex-1">
        <p className="font-bold" style={{ color: textColor }}>{label}</p>
        <p className="text-xs" style={{ color: textColor + "80" }}>{desc}</p>
      </div>
    </div>
  );
}

function buildDefaultSections(carousels: Record<string, unknown>[]): string[] {
  const order: string[] = [];

  for (const type of ["HERO", "BANNER"] as const) {
    const items = carousels
      .filter((c) => (c.type as string) === type && c.active !== false)
      .sort((a, b) => ((a.order as number) || 0) - ((b.order as number) || 0));
    for (const item of items) {
      order.push(CAROUSEL_PREFIX + item.id);
    }
  }

  order.push("featured");

  const cards = carousels
    .filter((c) => (c.type as string) === "CARDS" && c.active !== false)
    .sort((a, b) => ((a.order as number) || 0) - ((b.order as number) || 0));
  for (const item of cards) {
    order.push(CAROUSEL_PREFIX + item.id);
  }

  order.push("location");

  return order;
}

function migrateOldSections(sections: string[], carousels: Record<string, unknown>[]): string[] {
  const newOrder: string[] = [];

  for (const section of sections) {
    if (section === "hero") {
      const heros = carousels
        .filter((c) => (c.type as string) === "HERO" && c.active !== false)
        .sort((a, b) => ((a.order as number) || 0) - ((b.order as number) || 0));
      for (const item of heros) {
        newOrder.push(CAROUSEL_PREFIX + item.id);
      }
    } else if (section === "banner") {
      const banners = carousels
        .filter((c) => (c.type as string) === "BANNER" && c.active !== false)
        .sort((a, b) => ((a.order as number) || 0) - ((b.order as number) || 0));
      for (const item of banners) {
        newOrder.push(CAROUSEL_PREFIX + item.id);
      }
    } else if (section === "cards") {
      const cards = carousels
        .filter((c) => (c.type as string) === "CARDS" && c.active !== false)
        .sort((a, b) => ((a.order as number) || 0) - ((b.order as number) || 0));
      for (const item of cards) {
        newOrder.push(CAROUSEL_PREFIX + item.id);
      }
    } else {
      newOrder.push(section);
    }
  }

  return newOrder;
}

export default function PageOrderSection({ config, primaryColor, secondaryColor, carousels }: Props) {
  const textColor = getContrastColor(secondaryColor);

  const carouselsConfig = (config?.carousels as Record<string, unknown>[]) || [];
  const carouselMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const c of carouselsConfig) {
      map.set(c.id as string, c);
    }
    return map;
  }, [carouselsConfig]);

  const rawOrder = config?.sectionOrder;
  let initialSections: string[];
  try {
    const parsed = typeof rawOrder === "string" ? JSON.parse(rawOrder) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasNewFormat = parsed.some((s: string) => isCarouselId(s));
      if (hasNewFormat) {
        initialSections = parsed as string[];
      } else {
        initialSections = migrateOldSections(parsed as string[], carouselsConfig);
      }
    } else {
      initialSections = buildDefaultSections(carouselsConfig);
    }
  } catch {
    initialSections = buildDefaultSections(carouselsConfig);
  }

  const [sections, setSections] = useState<string[]>(initialSections);

  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  useEffect(() => {
    if (!carousels) return;
    const activos = carousels.filter((c) => c.active !== false);
    const idsValidos = new Set(activos.map((c) => CAROUSEL_PREFIX + c.id));
    const prev = sectionsRef.current;
    const podados = prev.filter((s) => !isCarouselId(s) || idsValidos.has(s));
    const existentes = new Set(podados);
    const nuevosHeroBanner: string[] = [];
    const nuevosCards: string[] = [];
    for (const c of activos) {
      const id = CAROUSEL_PREFIX + c.id;
      if (existentes.has(id)) continue;
      if (c.type === "CARDS") nuevosCards.push(id);
      else nuevosHeroBanner.push(id);
    }
    if (nuevosHeroBanner.length === 0 && nuevosCards.length === 0 && podados.length === prev.length) return;
    let siguiente = [...podados];
    const idxFeatured = siguiente.indexOf("featured");
    if (nuevosHeroBanner.length > 0) {
      const en = idxFeatured >= 0 ? idxFeatured : siguiente.length;
      siguiente = [...siguiente.slice(0, en), ...nuevosHeroBanner, ...siguiente.slice(en)];
    }
    if (nuevosCards.length > 0) {
      const idxLocation = siguiente.indexOf("location");
      const en = idxLocation >= 0 ? idxLocation : siguiente.length;
      siguiente = [...siguiente.slice(0, en), ...nuevosCards, ...siguiente.slice(en)];
    }
    setSections(siguiente);
    void updateSectionOrder(siguiente).then((res) => {
      if (res.success) toast.success("Orden actualizado");
      else toast.error(res.error || "Error al guardar orden");
    });
  }, [carousels]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.indexOf(active.id as string);
    const newIndex = sections.indexOf(over.id as string);
    const newOrder = arrayMove(sections, oldIndex, newIndex);
    setSections(newOrder);

    const res = await updateSectionOrder(newOrder);
    if (res.success) {
      toast.success("Orden actualizado");
    } else {
      toast.error(res.error || "Error al guardar orden");
      setSections(initialSections);
    }
  };

  const getSectionInfo = (id: string) => {
    if (isCarouselId(id)) {
      const c = carouselMap.get(getCarouselId(id));
      if (c) {
        const type = (c.type as string) || "";
        const Icon = CAROUSEL_ICONS[type] || ImageIcon;
        const typeLabel = TYPE_LABELS[type] || type;
        const title = (c.title as string) || typeLabel;
        return { label: title, icon: Icon, desc: typeLabel };
      }
    }

    const fixed = FIXED_SECTIONS[id];
    if (fixed) return fixed;

    return { label: id, icon: ImageIcon, desc: "" };
  };

  return (
    <section
      className="rounded-[2rem] border p-8"
      style={{
        backgroundColor: secondaryColor,
        color: textColor,
        borderColor: textColor + "22",
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: primaryColor + "33", color: primaryColor }}
        >
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Orden de Página
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: textColor + "99" }}>
            Arrastra para reordenar las secciones de la home
          </p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mb-6">
            {sections.map((id) => {
              const info = getSectionInfo(id);
              return (
                <SortableSection
                  key={id}
                  id={id}
                  label={info.label}
                  icon={info.icon}
                  desc={info.desc}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
