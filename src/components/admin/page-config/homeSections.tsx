"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import GridModal from "@/components/admin/page-config/GridModal";
import { getProductsPicker } from "@/actions/home-config/getProductsPicker";
import { getCategoriesPicker } from "@/actions/home-config/getCategoriesPicker";
import { updateSectionVisibility, updateHomeGrids } from "@/actions/page-config/home.actions";

import { SelectItem } from "@/components/admin/destination-picker/types";

export default function HomeSectionsConfig({ config, primaryColor = "#a80000", secondaryColor = "#ffffff" }: any) {
  const [isPending, startTransition] = useTransition();
  const [layout, setLayout] = useState(config?.featuredLayout?.toLowerCase() ?? "grid");
  const [grids, setGrids] = useState(config?.homegrid?.grids || []);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrid, setEditingGrid] = useState<any>(null);

  const [products, setProducts] = useState<SelectItem[]>([]);
  const [categories, setCategories] = useState<SelectItem[]>([]);

  const router = useRouter();

  useEffect(() => {
    setLayout(config?.featuredLayout?.toLowerCase() ?? "grid");
    const rawGrids = config?.homegrid?.grids || [];
    const gridsWithDestination = rawGrids.map((grid: any) => ({
      ...grid,
      destination: {
        type: grid.linkType?.toLowerCase() || "none",
        value: grid.linkValue || "",
      },
    }));
    setGrids(gridsWithDestination); async function loadPickers() {

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
      // Editar existente
      setGrids(grids.map((g: any) => g.id === editingGrid.id ? { ...g, ...data } : g));
    } else {
      // Agregar nuevo (usamos un ID temporal único)
      setGrids([...grids, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingGrid(null);
  };

  const handleRemove = (id: string) => {
    setGrids(grids.filter((g: any) => g.id !== id));
  };

  const handleSave = async () => {
    // Intentamos obtener el ID de la configuración, 
    // si no existe, lanzamos un error más descriptivo para saber qué pasa
    const homeGridId = config?.homegrid?.id;

    startTransition(async () => {
      try {
        const gridsForServer = grids.map((g: any) => ({
          id: g.id, // necesario para identificar si es edición? El server action usa delete + create, así que no importa
          title: g.title,
          subtitle: g.subtitle,
          image: g.image,
          linkType: g.destination?.type?.toUpperCase() || "NONE",
          linkValue: g.destination?.value || "",
        }));

        const [layoutRes, gridRes] = await Promise.all([
          updateSectionVisibility({ featuredLayout: layout }),
          updateHomeGrids(homeGridId, gridsForServer)
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
    <section className="space-y-8 rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
      {/* 1. SECTOR DE DISEÑO */}
      <div>
        <h2 className="text-xl font-black uppercase italic mb-6 text-neutral-900" style={{ color: primaryColor }}>Diseño de Featured Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["grid", "collage", "minimal"].map((type) => (
            <button key={type} onClick={() => setLayout(type)}
              className={`p-6 rounded-2xl border-2 transition-all ${layout === type ? "border-cyan-500 bg-cyan-50" : "border-neutral-200"}`}>
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SECTOR DE SECCIONES (Grids) */}
      <div className="border-t pt-8">
        <h3 className="font-bold mb-4">Secciones actuales ({grids.length})</h3>
        <div className="space-y-4">
          {grids.map((grid: any) => (
            <div key={grid.id} className="flex items-center gap-4 p-4 border rounded-xl bg-neutral-50">
              <img src={grid.image} className="w-16 h-16 object-cover rounded-lg" alt="" />
              <div className="flex-1">
                <p className="font-bold">{grid.title}</p>
                <p className="text-xs text-neutral-500">{grid.subtitle}</p>
              </div>
              <button onClick={() => { setEditingGrid(grid); setIsModalOpen(true); }} className="p-2 text-neutral-500"><Pencil size={18} /></button>
              <button onClick={() => handleRemove(grid.id)} className="p-2 text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}

          <button
            onClick={() => { setEditingGrid(null); setIsModalOpen(true); }}
            className="w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all"
          >
            <Plus size={20} /> Agregar Nueva Sección
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={isPending} className="w-full h-14 font-black rounded-2xl transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
        {isPending ? "Guardando..." : "Guardar Todo"}
      </button>

      <GridModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddOrEdit}
        initialData={editingGrid}
        products={products}
        categories={categories}
      />
    </section>
  );
}