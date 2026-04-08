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
  sizes: { id: string; code: string }[];
  providers?: { id: string; name: string }[]; // Agregado para soportar supplierId
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

  // Solución al error de tipos ts(2345) de Field Arrays
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
      toast.error(res.error);
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
          <h2 className="text-xl font-bold text-white">Nuevo Producto</h2>
          <button onClick={handleClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase">Nombre</label>
              <Input {...register("name")} className="bg-neutral-950 border-neutral-800 text-white" />
              {errors.name?.message && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase">Precio Base</label>
              <Input type="number" step="0.01" {...register("price")} className="bg-neutral-950 border-neutral-800 text-white" />
              {errors.price?.message && <p className="text-[10px] text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase">Categoría</label>
              <select
                {...register("categoryId")}
                className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white outline-none"
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              {errors.categoryId?.message && <p className="text-[10px] text-red-500">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase">Proveedor (Opcional)</label>
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
              <label className="text-xs font-medium text-neutral-400 uppercase">Descripción</label>
              <Input {...register("description")} className="bg-neutral-950 border-neutral-800 text-white" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-t border-neutral-800 pt-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Stock por Talles</h3>
              <Button type="button" variant="blanco" size="sm" onClick={() => append({ sizeId: "", sku: "", stock: 0 })}>
                <Plus size={14} className="mr-1" /> Talle
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start bg-neutral-950/50 p-3 rounded-xl border border-neutral-800">
                  <div className="flex-1">
                    <select
                      {...register(`variants.${index}.sizeId` as const)}
                      className="w-full h-9 px-2 rounded bg-neutral-900 border border-neutral-800 text-xs text-white outline-none"
                    >
                      <option value="">Talle</option>
                      {sizes.map((s) => (<option key={s.id} value={s.id}>{s.code}</option>))}
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <Input {...register(`variants.${index}.sku` as const)} placeholder="SKU (Opcional)" className="h-9 bg-neutral-900 border-neutral-800 text-xs text-white" />
                  </div>
                  <div className="flex-1">
                    <Input type="number" {...register(`variants.${index}.stock` as const)} className="h-9 bg-neutral-900 border-neutral-800 text-xs text-white" />
                  </div>
                  <button type="button" onClick={() => remove(index)} className="text-neutral-500 hover:text-red-400 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {variantsErrorMessage && (
              <div className="text-xs text-red-500 text-center bg-red-500/10 py-2 rounded-lg">
                {variantsErrorMessage}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="amarillo" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}