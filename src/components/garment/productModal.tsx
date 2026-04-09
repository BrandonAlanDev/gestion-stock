"use client";

import { useState, useMemo } from "react"; // 1. Importamos useMemo
import { createGarment } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { X, Plus, Package, DollarSign, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categories: any[];
  sizes: any[]; // Aquí vienen los grupos (SizeTypes) con sus talles adentro
  providers: any[];
}

export default function ProductModal({ categories, sizes, providers }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    description: "",
    categoryId: "",
    supplierId: "",
    variants: [] as { sizeId: string; stock: number; sku: string }[],
  });

  // --- LÓGICA DE FILTRADO DE TALLES ---
  const availableSizes = useMemo(() => {
    if (!formData.categoryId) return [];
    
    // Buscamos la categoría seleccionada en la lista
    const selectedCat = categories.find(c => c.id === formData.categoryId);
    
    // Si la categoría no tiene un grupo de talles asignado (sizeTypeId), devolvemos vacío
    if (!selectedCat || !selectedCat.sizeTypeId) return [];

    // Buscamos el grupo de talles que coincide con el ID que tiene la categoría
    const sizeGroup = sizes.find(group => group.id === selectedCat.sizeTypeId);
    
    // Devolvemos solo los talles de ese grupo específico
    return sizeGroup ? sizeGroup.sizes : [];
  }, [formData.categoryId, categories, sizes]);

  // Función para cambiar categoría y limpiar variantes viejas
  const handleCategoryChange = (id: string) => {
    setFormData({
      ...formData,
      categoryId: id,
      variants: [] // Limpiamos variantes para no mezclar talles de grupos distintos
    });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sizeId: "", stock: 0, sku: "" }],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createGarment(formData);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Producto creado exitosamente");
      setIsOpen(false);
      setFormData({ name: "", price: "", cost: "", description: "", categoryId: "", supplierId: "", variants: [] });
    }
  };

  if (!isOpen) return (
    <Button variant="amarillo" onClick={() => setIsOpen(true)} className="font-bold uppercase tracking-tighter rounded-xl">
      + Nuevo Producto
    </Button>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
              <Package className="text-amber-500" size={20} /> Nuevo Ingreso de Stock
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Nombre del Producto</label>
              <input required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Categoría</label>
              <select 
                required 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-amber-500"
                value={formData.categoryId}
                onChange={e => handleCategoryChange(e.target.value)} // CAMBIO AQUÍ
              >
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Precio Venta ($)</label>
              <input type="number" step="0.01" required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-emerald-500 font-mono outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Costo Compra ($)</label>
              <input type="number" step="0.01" required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-amber-500 font-mono outline-none" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Proveedor</label>
              <select className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                <option value="">Ninguno</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Variantes de Talle Dinámicas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Variantes de Talle y Stock</h3>
              {formData.categoryId && availableSizes.length > 0 && (
                <button type="button" onClick={handleAddVariant} className="text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase">+ Agregar Talle</button>
              )}
            </div>
            
            {!formData.categoryId ? (
              <p className="text-center text-[10px] text-neutral-600 uppercase py-4">Selecciona una categoría para ver talles</p>
            ) : availableSizes.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl justify-center text-amber-200/50">
                <AlertCircle size={14} />
                <p className="text-[10px] font-bold uppercase">Esta categoría no tiene talles vinculados</p>
              </div>
            ) : (
              formData.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/50">
                  <select 
                    required
                    className="bg-transparent text-xs text-white outline-none"
                    value={variant.sizeId}
                    onChange={e => {
                      const newVariants = [...formData.variants];
                      newVariants[index].sizeId = e.target.value;
                      setFormData({...formData, variants: newVariants});
                    }}
                  >
                    <option value="" className="bg-neutral-950">Talle...</option>
                    {/* MAREAMOS SOLO LOS TALLLES FILTRADOS */}
                    {availableSizes.map(s => <option key={s.id} value={s.id} className="bg-neutral-950">{s.value}</option>)}
                  </select>
                  <input type="number" placeholder="Stock" className="bg-transparent text-xs text-white outline-none border-l border-neutral-800 pl-3" value={variant.stock} onChange={e => {
                    const newVariants = [...formData.variants];
                    newVariants[index].stock = parseInt(e.target.value);
                    setFormData({...formData, variants: newVariants});
                  }} />
                  <input placeholder="SKU" className="bg-transparent text-[10px] text-amber-500 font-mono outline-none border-l border-neutral-800 pl-3 uppercase" value={variant.sku} onChange={e => {
                    const newVariants = [...formData.variants];
                    newVariants[index].sku = e.target.value;
                    setFormData({...formData, variants: newVariants});
                  }} />
                </div>
              ))
            )}
          </div>

          <Button type="submit" disabled={loading} variant="amarillo" className="w-full py-6 font-black uppercase tracking-widest text-sm rounded-2xl">
            {loading ? "Procesando..." : "Confirmar e Ingresar Producto"}
          </Button>
        </form>
      </div>
    </div>
  );
}