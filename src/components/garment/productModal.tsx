"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { createGarment, updateGarment } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { X, Package, Edit3, ChevronDown } from "lucide-react"; 
import { toast } from "sonner";

//  COMPONENTE PARA EL SELECTOR DE COLOR ---
function ColorDropdown({ colors, value, onChange }: { colors: any[], value: string, onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = colors.find(c => c.id === value);

  useEffect(() => {
    const clickOut = (e: any) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-transparent text-xs text-white cursor-pointer py-1 uppercase font-medium"
      >
        <span className={selected ? "text-white" : "text-neutral-500"}>
          {selected ? selected.name : "Color..."}
        </span>
        <ChevronDown size={12} className={`text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute top-full left-0 z-[110] w-48 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
          {/* LÍMITE: 6 items * 32px de altura = 192px */}
          <div className="max-h-[192px] overflow-y-auto custom-scrollbar">
            {colors.map(c => (
              <div 
                key={c.id}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className="px-4 py-2 text-[11px] text-white hover:bg-amber-500 hover:text-black cursor-pointer transition-colors"
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductModal({ categories, sizes, providers, colors, garment }: Props) {
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
      id: v.id,
      sizeId: v.sizeId,
      colorId: v.colorId || "",
      stock: v.stock,
      sku: v.sku || ""
    })) || [],
  });

  const availableSizes = useMemo(() => {
    if (!formData.categoryId) return [];
    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    if (!selectedCat) return [];
    if (selectedCat.sizeType?.sizes && selectedCat.sizeType.sizes.length > 0) return selectedCat.sizeType.sizes;
    return sizes.find((st) => st.id === selectedCat.sizeTypeId)?.sizes || [];
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

  const modal = isOpen && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto text-white">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-4xl my-auto rounded-3xl shadow-2xl relative">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-950 z-10 rounded-t-3xl">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
            {isEdit ? <Edit3 size={20} className="text-amber-500" /> : <Package size={20} className="text-amber-500" />}
            {isEdit ? "Editar Producto" : "Nuevo Ingreso"}
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <select className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value, variants: [] })}>
              <option value="">Categoría...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Venta" className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-emerald-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            <input type="number" placeholder="Costo" className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-amber-500" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
            <select className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white" value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })}>
              <option value="">Proveedor...</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Variantes</span>
              <button type="button" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { sizeId: "", colorId: "", stock: 0, sku: "" }] })} className="text-amber-500 text-[10px] font-bold uppercase">+ Agregar Variante</button>
            </div>

            <div className="space-y-3">
              {formData.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/50 items-center">
                  <div className="col-span-3">
                    <select className="w-full bg-transparent text-xs text-white outline-none font-medium cursor-pointer" value={v.sizeId} onChange={e => {
                      const newV = [...formData.variants]; newV[i].sizeId = e.target.value; setFormData({ ...formData, variants: newV });
                    }}>
                      <option value="" className="bg-neutral-900 text-white">Talle...</option>
                      {availableSizes.map(s => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.value}</option>)}
                    </select>
                  </div>

                  {/*  SELECTOR DE COLOR CON LÍMITE */}
                  <div className="col-span-3 border-l border-neutral-800 pl-3">
                    <ColorDropdown 
                      colors={colors} 
                      value={v.colorId} 
                      onChange={(id) => {
                        const newV = [...formData.variants];
                        newV[i].colorId = id;
                        setFormData({ ...formData, variants: newV });
                      }} 
                    />
                  </div>

                  <div className="col-span-2 border-l border-neutral-800 pl-3">
                    <input type="number" placeholder="Stock" className="w-full bg-transparent text-xs text-white outline-none" value={v.stock} onChange={e => {
                      const newV = [...formData.variants]; newV[i].stock = parseInt(e.target.value) || 0; setFormData({ ...formData, variants: newV });
                    }} />
                  </div>

                  <div className="col-span-3 border-l border-neutral-800 pl-3">
                    <input placeholder="SKU" className="w-full bg-transparent text-[10px] text-amber-500 outline-none uppercase" value={v.sku} onChange={e => {
                      const newV = [...formData.variants]; newV[i].sku = e.target.value; setFormData({ ...formData, variants: newV });
                    }} />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => {
                      const newV = formData.variants.filter((_, idx) => idx !== i); setFormData({ ...formData, variants: newV });
                    }} className="text-neutral-700 hover:text-red-500"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} variant="amarillo" className="w-full py-6 font-black uppercase rounded-2xl">
            {loading ? "Procesando..." : (isEdit ? "Guardar Cambios" : "Crear Producto")}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );

  const trigger = isEdit ? (
    <button onClick={() => setIsOpen(true)} className="text-[10px] font-bold text-neutral-600 hover:text-white uppercase">Editar</button>
  ) : (
    <Button variant="amarillo" onClick={() => setIsOpen(true)} className="font-bold uppercase rounded-xl">+ Nuevo Producto</Button>
  );

  return <>{trigger}{modal}</>;
}