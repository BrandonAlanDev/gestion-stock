"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { createGarment, updateGarment } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { X, Package, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categories: any[];
  sizes: any[];
  providers: any[];
  garment?: any;
}

export default function ProductModal({ categories, sizes, providers, garment }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isEdit = !!garment;

  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    name: garment?.name || "",
    price: garment?.price?.toString() || "",
    cost: garment?.cost?.toString() || "",
    description: garment?.description || "",
    categoryId: garment?.categoryId || "",
    supplierId: garment?.supplierId || "",
    variants: garment?.variants?.map((v: any) => ({
      id: v.id, sizeId: v.sizeId, stock: v.stock, sku: v.sku || ""
    })) || [],
  });

  const availableSizes = useMemo(() => {
    const selectedCat = categories.find(c => c.id === formData.categoryId);
    return sizes.find(g => g.id === selectedCat?.sizeTypeId)?.sizes || [];
  }, [formData.categoryId, categories, sizes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = isEdit ? await updateGarment(garment.id, formData) : await createGarment(formData);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Operación exitosa");
      setIsOpen(false);
    }
  };

  if (!mounted) return null;

  const trigger = isEdit ? (
    <button onClick={() => setIsOpen(true)} className="text-[10px] font-bold text-neutral-600 hover:text-white uppercase">Editar</button>
  ) : (
    <Button variant="amarillo" onClick={() => setIsOpen(true)} className="font-bold uppercase rounded-xl">+ Nuevo Producto</Button>
  );

  const modal = isOpen && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-3xl my-auto rounded-3xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-950 z-10 rounded-t-3xl">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
            {isEdit ? <Edit3 size={20} className="text-amber-500" /> : <Package size={20} className="text-amber-500" />}
            {isEdit ? "Editar Producto" : "Nuevo Ingreso"}
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <select className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value, variants: []})}>
              <option value="">Categoría...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Venta" className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-emerald-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <input type="number" placeholder="Costo" className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-amber-500" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            <select className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
              <option value="">Proveedor...</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Variantes</span>
              <button type="button" onClick={() => setFormData({...formData, variants: [...formData.variants, {sizeId: "", stock: 0, sku: ""}]})} className="text-amber-500 text-[10px] font-bold uppercase">+ Agregar</button>
            </div>
            {formData.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/50">
                <select className="bg-transparent text-xs text-white outline-none" value={v.sizeId} onChange={e => {
                  const newV = [...formData.variants]; newV[i].sizeId = e.target.value; setFormData({...formData, variants: newV});
                }}>
                  <option value="">Talle...</option>
                  {availableSizes.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
                </select>
                <input type="number" placeholder="Stock" className="bg-transparent text-xs text-white border-l border-neutral-800 pl-3" value={v.stock} onChange={e => {
                  const newV = [...formData.variants]; newV[i].stock = parseInt(e.target.value); setFormData({...formData, variants: newV});
                }} />
                <input placeholder="SKU" className="bg-transparent text-[10px] text-amber-500 border-l border-neutral-800 pl-3 uppercase" value={v.sku} onChange={e => {
                  const newV = [...formData.variants]; newV[i].sku = e.target.value; setFormData({...formData, variants: newV});
                }} />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading} variant="amarillo" className="w-full py-6 font-black uppercase rounded-2xl">
            {loading ? "Procesando..." : "Confirmar"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );

  return <>{trigger}{modal}</>;
}