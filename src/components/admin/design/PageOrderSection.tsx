"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Grid2X2,
  MapPin,
  GripVertical,
  Save,
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

interface Props {
  config: Record<string, unknown>;
  primaryColor: string;
  secondaryColor: string;
}

const SECTION_LABELS: Record<string, { label: string; icon: React.ElementType; desc: string }> = {
  hero: { label: "Hero", icon: LayoutDashboard, desc: "Carrusel principal fullscreen" },
  banner: { label: "Banner", icon: Megaphone, desc: "Franja publicitaria rotativa" },
  featured: { label: "Featured", icon: Grid2X2, desc: "Sección destacada con grids" },
  cards: { label: "Cards", icon: ImageIcon, desc: "Grilla de tarjetas" },
  location: { label: "Ubicación", icon: MapPin, desc: "Mapa y dirección" },
};

function SortableSection({
  id,
  primaryColor,
  secondaryColor,
}: {
  id: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  const textColor = getContrastColor(secondaryColor);
  const info = SECTION_LABELS[id] || { label: id, icon: ImageIcon, desc: "" };
  const Icon = info.icon;

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
        <p className="font-bold" style={{ color: textColor }}>{info.label}</p>
        <p className="text-xs" style={{ color: textColor + "80" }}>{info.desc}</p>
      </div>
    </div>
  );
}

export default function PageOrderSection({ config, primaryColor, secondaryColor }: Props) {
  const textColor = getContrastColor(secondaryColor);

  const rawOrder = config?.sectionOrder;
  let initialSections: string[];
  try {
    initialSections = typeof rawOrder === "string" ? JSON.parse(rawOrder) : ["hero", "banner", "featured", "cards", "location"];
  } catch {
    initialSections = ["hero", "banner", "featured", "cards", "location"];
  }

  const [sections, setSections] = useState<string[]>(initialSections);
  const [isPending, setIsPending] = useState(false);

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

  const handleSave = async () => {
    setIsPending(true);
    const res = await updateSectionOrder(sections);
    if (res.success) {
      toast.success("Orden guardado");
    } else {
      toast.error(res.error || "Error al guardar");
    }
    setIsPending(false);
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
            {sections.map((id) => (
              <SortableSection key={id} id={id} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="h-14 px-8 rounded-2xl font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3 hover:cursor-pointer opacity-90 hover:opacity-100 transition"
        style={{
          backgroundColor: primaryColor,
          color: getContrastColor(primaryColor),
        }}
      >
        <Save size={18} />
        {isPending ? "Guardando..." : "Guardar Orden"}
      </button>
    </section>
  );
}
