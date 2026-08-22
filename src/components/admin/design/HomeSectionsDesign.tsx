"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Grid2X2, Columns3, LayoutDashboard, GripVertical } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GridModal from "./GridModal";
import { getProductsPicker } from "@/actions/home-config/getProductsPicker";
import { getCategoriesPicker } from "@/actions/home-config/getCategoriesPicker";
import { updateSectionVisibility, updateHomeGrids } from "@/actions/page-config/home.actions";

import { SelectItem } from "@/components/admin/destination-picker/types";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

function SortableGridItem({ grid, primaryColor, secondaryColor, onEdit, onRemove }: {
  grid: any;
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

export default function HomeSectionsDesign({ config, primaryColor = "#06b6d4", secondaryColor = "#ffffff" }: any) {
  const [isPending, startTransition] = useTransition();
  const [layout, setLayout] = useState(config?.featuredLayout?.toLowerCase() ?? "grid");
  const [grids, setGrids] = useState(
    (config?.homegrid?.grids || []).map((g: any) => ({ ...g, id: String(g.id) }))
  );
  const [sectionTitle, setSectionTitle] = useState(config?.homegrid?.title || "Home Destacado");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrid, setEditingGrid] = useState<any>(null);

  const [products, setProducts] = useState<SelectItem[]>([]);
  const [categories, setCategories] = useState<SelectItem[]>([]);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = grids.findIndex((g: any) => g.id === active.id);
    const newIndex = grids.findIndex((g: any) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setGrids(arrayMove(grids, oldIndex, newIndex));
  };

  useEffect(() => {
    setLayout(config?.featuredLayout?.toLowerCase() ?? "grid");
    setSectionTitle(config?.homegrid?.title || "Home Destacado");
    const rawGrids = config?.homegrid?.grids || [];
    const gridsWithDestination = rawGrids.map((grid: any) => ({
      ...grid,
      id: String(grid.id),
      destination: {
        type: grid.linkType?.toLowerCase() || "none",
        value: grid.linkValue || "",
      },
    }));
    setGrids(gridsWithDestination); 

    async function loadPickers() {
      const productsData = await getProductsPicker();
      const categoriesData = await getCategoriesPicker();

      setProducts(
        productsData.map((p: any) => ({
          id: p.id,
          label: p.name,
        }))
      );

      setCategories(
        categoriesData.map((c: any) => ({
          id: c.id,
          label: c.name,
        }))
      );
    }

    loadPickers();
  }, [config]);

  const handleAddOrEdit = (data: any) => {
    if (editingGrid) {
      setGrids(grids.map((g: any) => g.id === editingGrid.id ? { ...g, ...data } : g));
    } else {
      setGrids([...grids, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingGrid(null);
  };

  const handleRemove = (id: string) => {
    setGrids(grids.filter((g: any) => g.id !== id));
  };

  const handleSave = async () => {
    const homeGridId = config?.homegrid?.id;

    startTransition(async () => {
      try {
        const gridsForServer = grids.map((g: any, idx: number) => ({
          id: g.id,
          title: g.title,
          subtitle: g.subtitle,
          image: g.image,
          order: idx,
          linkType: g.destination?.type?.toUpperCase() || "NONE",
          linkValue: g.destination?.value || "",
          subtitleNeon: g.subtitleNeon ?? false,
          subtitleDim: g.subtitleDim ?? false,
          linkStyle: g.linkStyle || "IMAGE",
          buttonVariant: g.buttonVariant || "DEFAULT",
          buttonText: g.buttonText || null,
          buttonBgColor: g.buttonBgColor || null,
          buttonTextColor: g.buttonTextColor || null,
        }));

        const [layoutRes, gridRes] = await Promise.all([
          updateSectionVisibility({ featuredLayout: layout }),
          updateHomeGrids(homeGridId, gridsForServer, sectionTitle)
        ]);

        if (!layoutRes.ok || !gridRes.ok) {
          toast.error("Error al guardar: " + (layoutRes.error || gridRes.error));
        } else {
          toast.success("Todo guardado correctamente");
          setIsModalOpen(false);
          setEditingGrid(null);
          router.refresh();
        }
      } catch (e) {
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
          <SortableContext items={grids.map((g: any) => g.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {grids.map((grid: any) => (
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
        products={products}
        categories={categories}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </section>
  );
}
