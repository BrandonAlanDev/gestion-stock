"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Grid2X2, Columns3, LayoutDashboard, GripVertical } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GridModal, { type DatosTarjeta, type SelectorCategoria } from "./GridModal";
import { getCategoriesPicker } from "@/actions/home-config/getCategoriesPicker";
import { updateSectionVisibility, updateHomeGrids } from "@/actions/page-config/home.actions";
import { getContrastColor } from "@/lib/utils";

export interface GridLocal extends DatosTarjeta {
  id: string;
}

interface GridConfig {
  id: string | number;
  title?: string | null;
  subtitle?: string | null;
  image?: string;
  linkType?: string;
  linkValue?: string | null;
  subtitleNeon?: boolean;
  subtitleDim?: boolean;
  linkStyle?: string;
  buttonVariant?: string;
  buttonText?: string | null;
  buttonBgColor?: string | null;
  buttonTextColor?: string | null;
  order?: number;
}

interface ConfigHomeSections {
  featuredLayout?: string | null;
  homegrid?: {
    id?: string;
    title?: string | null;
    grids: GridConfig[];
  } | null;
}

interface Props {
  config?: ConfigHomeSections;
  primaryColor?: string;
  secondaryColor?: string;
  alGuardar?: () => void;
}

const RELACION_ASPECTO: Record<string, number> = {
  grid: 16 / 10,
  collage: 16 / 10,
  minimal: 4 / 3,
};

function normalizarGrid(grid: GridConfig): GridLocal {
  const tiposEnlace = ["NONE", "CATEGORY", "PAGE", "EXTERNAL"] as const;
  const estilosEnlace = ["IMAGE", "BUTTON"] as const;
  const variantesBoton = ["DEFAULT", "STRAIGHT", "TRANSPARENT"] as const;

  return {
    id: String(grid.id),
    title: grid.title ?? "",
    subtitle: grid.subtitle ?? "",
    image: grid.image ?? "",
    linkType: tiposEnlace.includes(grid.linkType as (typeof tiposEnlace)[number])
      ? (grid.linkType as DatosTarjeta["linkType"])
      : "NONE",
    linkValue: grid.linkValue ?? "",
    subtitleNeon: grid.subtitleNeon ?? false,
    subtitleDim: grid.subtitleDim ?? false,
    linkStyle: estilosEnlace.includes(grid.linkStyle as (typeof estilosEnlace)[number])
      ? (grid.linkStyle as DatosTarjeta["linkStyle"])
      : "IMAGE",
    buttonVariant: variantesBoton.includes(grid.buttonVariant as (typeof variantesBoton)[number])
      ? (grid.buttonVariant as DatosTarjeta["buttonVariant"])
      : "DEFAULT",
    buttonText: grid.buttonText ?? "",
    buttonBgColor: grid.buttonBgColor ?? "",
    buttonTextColor: grid.buttonTextColor ?? "",
  };
}

function SortableGridItem({ grid, primaryColor, secondaryColor, onEdit, onRemove }: {
  grid: GridLocal;
  primaryColor: string;
  secondaryColor: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: grid.id });
  const textColor = getContrastColor(secondaryColor);
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: textColor.concat("05"),
    borderColor: textColor.concat("22"),
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className="flex items-center gap-4 p-4 border rounded-xl"
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1 opacity-50 hover:opacity-100 transition-opacity">
        <GripVertical size={20} />
      </button>
      <img src={grid.image} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg" alt="" />
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{grid.title}</p>
        <p className="text-xs opacity-60">{grid.subtitle}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {grid.subtitleDim && <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>Gris</span>}
          {grid.subtitleNeon && <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>Neón</span>}
          {grid.linkStyle === "BUTTON" && <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>Botón: {grid.buttonVariant}</span>}
        </div>
      </div>
      <button onClick={onEdit} className="p-2 opacity-70 hover:opacity-100 transition-opacity">
        <Pencil size={18} />
      </button>
      <button onClick={onRemove} className="p-2 text-red-500 hover:text-red-600 transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function HomeSectionsDesign({
  config,
  primaryColor = "#06b6d4",
  secondaryColor = "#ffffff",
  alGuardar,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [layout, setLayout] = useState(config?.featuredLayout?.toLowerCase() ?? "grid");
  const [grids, setGrids] = useState<GridLocal[]>(
    (config?.homegrid?.grids || []).map(normalizarGrid)
  );
  const [sectionTitle, setSectionTitle] = useState(config?.homegrid?.title || "Home Destacado");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrid, setEditingGrid] = useState<GridLocal | null>(null);

  const [categories, setCategories] = useState<SelectorCategoria[]>([]);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = grids.findIndex((g) => g.id === active.id);
    const newIndex = grids.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setGrids(arrayMove(grids, oldIndex, newIndex));
  };

  useEffect(() => {
    setLayout(config?.featuredLayout?.toLowerCase() ?? "grid");
    setSectionTitle(config?.homegrid?.title || "Home Destacado");
    const rawGrids = config?.homegrid?.grids || [];
    setGrids(rawGrids.map(normalizarGrid));

    async function cargarCategorias() {
      const categoriasData = await getCategoriesPicker();
      setCategories(
        categoriasData.map((c) => ({
          id: c.id,
          label: c.name,
        }))
      );
    }

    cargarCategorias();
  }, [config]);

  const handleAddOrEdit = (data: DatosTarjeta) => {
    if (editingGrid) {
      setGrids(grids.map((g) => (g.id === editingGrid.id ? { ...g, ...data } : g)));
    } else {
      setGrids([...grids, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingGrid(null);
  };

  const handleRemove = (id: string) => {
    setGrids(grids.filter((g) => g.id !== id));
  };

  const handleSave = async () => {
    const homeGridId = config?.homegrid?.id;

    startTransition(async () => {
      try {
        const gridsForServer = grids.map((g, idx) => ({
          id: g.id,
          title: g.title.trim(),
          subtitle: g.subtitle.trim(),
          image: g.image,
          order: idx,
          linkType: g.linkType || "NONE",
          linkValue: g.linkValue || "",
          subtitleNeon: g.subtitleNeon ?? false,
          subtitleDim: g.subtitleDim ?? false,
          linkStyle: g.linkStyle || "IMAGE",
          buttonVariant: g.buttonVariant || "DEFAULT",
          buttonText: g.buttonText || undefined,
          buttonBgColor: g.buttonBgColor || undefined,
          buttonTextColor: g.buttonTextColor || undefined,
        }));

        const [layoutRes, gridRes] = await Promise.all([
          updateSectionVisibility({ featuredLayout: layout }),
          updateHomeGrids(homeGridId, gridsForServer, sectionTitle)
        ]);

        if (!layoutRes.ok || !gridRes.ok) {
          const layoutError = "error" in layoutRes ? layoutRes.error : "";
          const gridError = "error" in gridRes ? gridRes.error : "";
          toast.error("Error al guardar: " + (layoutError || gridError));
        } else {
          toast.success("Todo guardado correctamente");
          setIsModalOpen(false);
          setEditingGrid(null);
          alGuardar?.();
          router.refresh();
        }
      } catch {
        toast.error("Error inesperado al guardar");
      }
    });
  };

  return (
    <section
      className="space-y-8 rounded-[2rem] border p-4 shadow-sm sm:p-8"
      style={{
        backgroundColor: secondaryColor,
        color: getContrastColor(secondaryColor),
        borderColor: getContrastColor(secondaryColor).concat("22")
      }}
    >
      {/* 1. SECTOR DE DISEÑO */}
      <div>
        <h2
          className="text-xl font-black uppercase italic mb-6"
          style={{ color: primaryColor }}
        >
          Sección Destacada
        </h2>

        {/* Título editable */}
        <div className="mb-6">
          <label className="text-xs font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: getContrastColor(secondaryColor) }}>
            Título de la sección
          </label>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            className="w-full p-4 rounded-xl border bg-transparent font-bold"
            style={{
              borderColor: getContrastColor(secondaryColor).concat("44"),
              color: getContrastColor(secondaryColor),
            }}
            placeholder="Home Destacado"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["grid", "collage", "minimal"].map((type) => {
            const isSelected = layout === type;
            return (
              <button
                key={type}
                onClick={() => setLayout(type)}
                className="p-4 rounded-2xl gap-4 border-2 transition-all transition-200 hover:scale-[1.02] flex flex-col items-center justify-center"
                style={{
                  borderColor: isSelected ? primaryColor : getContrastColor(secondaryColor).concat("22"),
                  backgroundColor: isSelected ? primaryColor.concat("15") : "transparent",
                  color: isSelected ? primaryColor : getContrastColor(secondaryColor),
                  scale: isSelected ? 1.06 : 1,
                }}
              >
                <span className="text-2xl font-bold flex flex-row justify-center text-center align-middle items-center gap-2">
                  {type.toUpperCase() === "GRID" && <Grid2X2 size={48} className="text-2xl font-bold align-middle text-center" />}
                  {type.toUpperCase() === "COLLAGE" && <LayoutDashboard size={48} className="text-2xl font-bold align-middle text-center" />}
                  {type.toUpperCase() === "MINIMAL" && <Columns3 size={48} className="text-2xl font-bold align-middle text-center" />}
                  {type === "grid" ? "CUADRÍCULA" : type === "collage" ? "MOSAICO" : "MINIMALISTA"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECTOR DE SECCIONES (Grids) */}
      <div className="border-t pt-8" style={{ borderColor: getContrastColor(secondaryColor).concat("22") }}>
        <h3 className="font-bold mb-4">Secciones actuales ({grids.length})</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={grids.map((g) => g.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {grids.map((grid) => (
                <SortableGridItem
                  key={grid.id}
                  grid={grid}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  onEdit={() => { setEditingGrid(grid); setIsModalOpen(true); }}
                  onRemove={() => handleRemove(grid.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={() => { setEditingGrid(null); setIsModalOpen(true); }}
          className="w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all opacity-80 hover:opacity-100"
          style={{
            borderColor: getContrastColor(secondaryColor).concat("44"),
            backgroundColor: getContrastColor(secondaryColor).concat("05")
          }}
        >
          <Plus size={20} /> Agregar Nueva Sección
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full h-14 font-black rounded-2xl transition-opacity hover:opacity-90 uppercase tracking-wider"
        style={{
          backgroundColor: primaryColor,
          color: getContrastColor(primaryColor)
        }}
      >
        {isPending ? "Guardando..." : "Guardar Todo"}
      </button>

      <GridModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddOrEdit}
        initialData={editingGrid}
        categorias={categories}
        relacionAspecto={RELACION_ASPECTO[layout] ?? 16 / 10}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </section>
  );
}
