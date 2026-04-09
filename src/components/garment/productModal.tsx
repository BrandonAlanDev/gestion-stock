"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { garmentSchema, type GarmentInput } from "@/lib/zod";
import { createGarment } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categories: { id: string; name: string }[];
  // CAMBIO: Aquí usamos 'value' en lugar de 'code' para que coincida con el Schema
  sizes: { id: string; value: string }[]; 
  providers?: { id: string; name: string }[];
}

export default function ProductModal({ categories, sizes, providers = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GarmentInput>({
    resolver: zodResolver(garmentSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      categoryId: "",
      supplierId: "",
      variants: [{ sizeId: "", sku: "", stock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const variantsErrorMessage = errors.variants 
    ? (typeof errors.variants.message === "string" 
        ? errors.variants.message 
        : "Revisa los datos de las variantes")
    : null;

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: GarmentInput) => {
    const res = await createGarment(data);
    if (res?.error) {
      // Manejo de error si el SKU ya existe o falla la DB
      toast.error(typeof res.error === 'string' ? res.error : "Error al crear");
    } else {
      toast.success("Producto creado con éxito");
      handleClose();
    }
  };

  if (!isOpen)
    return (
      <Button variant="amarillo" onClick={() => setIsOpen(true)}>
        + Nuevo Producto
      </Button>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        
        <div className="sticky top-0 bg-neutral-900 z-10 flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Nuevo Producto</h2>
          <button onClick={handleClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Nombre del Modelo</label>
              <Input {...register("name")} placeholder="Ej: Zapatilla Running" className="bg-neutral-950 border-neutral-800 text-white" />
              {errors.name?.message && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Precio de Venta</label>
              <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="bg-neutral-950 border-neutral-800 text-white" />
              {errors.price?.message && <p className="text-[10px] text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categoría</label>
              <select
                {...register("categoryId")}
                className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              {errors.categoryId?.message && <p className="text-[10px] text-red-500">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Proveedor</label>
              <select
                {...register("supplierId")}
                className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white outline-none"
              >
                <option value="">Ninguno</option>
                {providers.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Descripción corta</label>
              <Input {...register("description")} className="bg-neutral-950 border-neutral-800 text-white" placeholder="Opcional..." />
          </div>

          {/* Gestión de Variantes (Talles y Stock) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-t border-neutral-800 pt-6">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em]">Variantes de Inventario</h3>
              <Button type="button" variant="blanco" size="sm" onClick={() => append({ sizeId: "", sku: "", stock: 0 })}>
                <Plus size={14} className="mr-1" /> Añadir Talle
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start bg-neutral-950/30 p-4 rounded-2xl border border-neutral-800/50">
                  <div className="w-1/4">
                    <select
                      {...register(`variants.${index}.sizeId` as const)}
                      className="w-full h-10 px-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white outline-none focus:border-amber-500"
                    >
                      <option value="">Talle</option>
                      {/* CAMBIO: Aquí usamos s.value en lugar de s.code */}
                      {sizes.map((s) => (<option key={s.id} value={s.id}>{s.value}</option>))}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <Input 
                      {...register(`variants.${index}.sku` as const)} 
                      placeholder="SKU / Código" 
                      className="h-10 bg-neutral-900 border-neutral-800 text-xs text-white" 
                    />
                  </div>

                  <div className="w-24">
                    <Input 
                      type="number" 
                      placeholder="Stock"
                      {...register(`variants.${index}.stock` as const, { valueAsNumber: true })} 
                      className="h-10 bg-neutral-900 border-neutral-800 text-xs text-white text-center" 
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={() => remove(index)} 
                    className="text-neutral-600 hover:text-red-500 p-2 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {variantsErrorMessage && (
              <div className="text-[10px] text-red-500 text-center bg-red-500/5 py-2 rounded-lg border border-red-500/20 uppercase font-bold">
                {variantsErrorMessage}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
            <Button type="button" variant="ghost" onClick={handleClose} className="text-neutral-400 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" variant="amarillo" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? "Procesando..." : "Registrar Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}