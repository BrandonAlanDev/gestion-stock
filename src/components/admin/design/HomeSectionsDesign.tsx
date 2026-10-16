"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Grid2X2, Columns3, LayoutDashboard, GripVertical } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GridModal, { type DatosTarjeta, type SelectorCategoria, type SelectorProducto } from "./GridModal";
import { getCategoriesPicker } from "@/actions/home-config/getCategoriesPicker";
import { getProductsPicker } from "@/actions/home-config/getProductsPicker";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import { actualizarSeccionDestacada } from "@/actions/page-config/secciones-destacadas.actions";

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

interface Props {
  homegrid?: {
    id?: string;
    title?: string | null;
    grids?: GridConfig[];
  } | null;
  featuredLayout?: string | null;
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
  const tiposEnlace = ["NONE", "CATEGORY", "PRODUCT", "EXTERNAL"] as const;
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

function SortableGridItem({ grid, onEdit, onRemove }: {
  grid: GridLocal;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: grid.id });
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className="flex items-center gap-4 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 text-[var(--admin-texto)]"
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1 text-[var(--admin-texto-suave)] opacity-70 transition-opacity hover:opacity-100">
        <GripVertical size={20} />
      </button>
      {grid.image ? (
        <Image src={grid.image} width={64} height={64} unoptimized={!imagenAdmiteOptimizacion(grid.image)} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg" alt="" />
      ) : (
        <div className="w-14 h-14 shrink-0 rounded-lg bg-[var(--admin-fondo-hover)] sm:h-16 sm:w-16" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{grid.title}</p>
        <p className="text-xs text-[var(--admin-texto-suave)]">{grid.subtitle}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {grid.subtitleDim && <span className="rounded bg-[var(--admin-fondo-hover)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--admin-texto-suave)]">Gris</span>}
          {grid.subtitleNeon && <span className="rounded bg-[var(--admin-fondo-hover)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--admin-texto-suave)]">Neón</span>}
          {grid.linkStyle === "BUTTON" && <span className="rounded bg-[var(--admin-fondo-hover)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--admin-texto-suave)]">Botón: {grid.buttonVariant}</span>}
        </div>
      </div>
      <button onClick={onEdit} aria-label="Editar sección" className="p-2 text-[var(--admin-texto-suave)] opacity-80 transition-opacity hover:opacity-100">
        <Pencil size={18} />
      </button>
      <button onClick={onRemove} aria-label="Eliminar sección" className="p-2 text-[var(--admin-peligro-accion)] transition-colors hover:opacity-80">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function HomeSectionsDesign({
  homegrid,
  featuredLayout,
  primaryColor = "#06b6d4",
  secondaryColor = "#ffffff",
  alGuardar,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [layout, setLayout] = useState(featuredLayout?.toLowerCase() ?? "grid");
  const [grids, setGrids] = useState<GridLocal[]>(
    (homegrid?.grids || []).map(normalizarGrid)
  );
  const [sectionTitle, setSectionTitle] = useState(homegrid?.title ?? "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrid, setEditingGrid] = useState<GridLocal | null>(null);

  const [categories, setCategories] = useState<SelectorCategoria[]>([]);
  const [productos, setProductos] = useState<SelectorProducto[]>([]);

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
    setLayout(featuredLayout?.toLowerCase() ?? "grid");
    setSectionTitle(homegrid?.title ?? "");
    const rawGrids = homegrid?.grids || [];
    setGrids(rawGrids.map(normalizarGrid));

    async function cargarOpciones() {
      const [categoriasData, productosData] = await Promise.all([
        getCategoriesPicker(),
        getProductsPicker(),
      ]);
      setCategories(
        categoriasData.map((c) => ({
          id: c.id,
          label: c.name,
        }))
      );
      setProductos(
        productosData.map((p) => ({
          id: p.id,
          label: p.name,
        }))
      );
    }

    cargarOpciones();
  }, [homegrid, featuredLayout]);

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

        const res = await actualizarSeccionDestacada(
          homegrid?.id ?? "",
          gridsForServer,
          sectionTitle,
          layout
        );

        if (!res.ok) {
          toast.error(res.error || "Error al guardar");
        } else {
          toast.success("Guardado correctamente");
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
      className="space-y-8 rounded-[2rem] border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4 text-[var(--admin-texto)] shadow-sm sm:p-8"
    >
      {/* 1. SECTOR DE DISEÑO */}
      <div>
        <h2
          className="mb-6 text-xl font-black uppercase italic text-[var(--admin-texto)]"
        >
          Sección Destacada
        </h2>

        {/* Título editable */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-[var(--admin-texto-suave)]">
            Título de la sección
          </label>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 font-bold text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20"
            placeholder="Dejalo vacío para ocultarlo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["grid", "collage", "minimal"].map((type) => {
            const isSelected = layout === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setLayout(type)}
                aria-pressed={isSelected}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200 hover:opacity-90 ${isSelected ? "border-[var(--admin-primario)] bg-[var(--admin-fondo-hover)] text-[var(--admin-primario)]" : "border-[var(--admin-borde)] text-[var(--admin-texto)] hover:border-[var(--admin-primario)]"}`}
              >
                {type === "grid" && <Grid2X2 size={40} className="shrink-0" />}
                {type === "collage" && <LayoutDashboard size={40} className="shrink-0" />}
                {type === "minimal" && <Columns3 size={40} className="shrink-0" />}
                <span className="text-sm sm:text-base font-bold text-center leading-tight px-1">
                  {type === "grid" ? "CUADRÍCULA" : type === "collage" ? "MOSAICO" : "MINIMALISTA"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECTOR DE SECCIONES (Grids) */}
      <div className="border-t border-[var(--admin-borde)] pt-8">
        <h3 className="font-bold mb-4">Secciones actuales ({grids.length})</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={grids.map((g) => g.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {grids.map((grid) => (
                <SortableGridItem
                  key={grid.id}
                  grid={grid}
                  onEdit={() => { setEditingGrid(grid); setIsModalOpen(true); }}
                  onRemove={() => handleRemove(grid.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={() => { setEditingGrid(null); setIsModalOpen(true); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--admin-borde)] py-4 text-[var(--admin-texto-suave)] opacity-80 transition-all hover:border-[var(--admin-primario)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)] hover:opacity-100"
        >
          <Plus size={20} /> Agregar Nueva Sección
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="h-14 w-full rounded-2xl bg-[var(--admin-primario)] font-black uppercase tracking-wider text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar Todo"}
      </button>

      <GridModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddOrEdit}
        initialData={editingGrid}
        categorias={categories}
        productos={productos}
        relacionAspecto={RELACION_ASPECTO[layout] ?? 16 / 10}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </section>
  );
}
