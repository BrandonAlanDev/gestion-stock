"use client";

import { useState } from "react";
import { X, Phone, Mail, Truck, Trash2 } from "lucide-react";
import ProductModal from "./productModal";
import { deleteGarment } from "@/actions/garments";
import { toast } from "sonner";

export default function QuickViewTable({ garments, categories, sizeTypes, providers, colors }: any) {
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`);
    
    if (confirmDelete) {
      const res = await deleteGarment(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Producto eliminado correctamente");
      }
    }
  };

  return (
    <>
      <div className="overflow-x-auto border border-neutral-900 rounded-[2.5rem] bg-black/40 backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-600 text-[9px] uppercase tracking-[0.3em] font-black">
              <th className="px-8 py-6">Ref. SKU</th>
              <th className="px-8 py-6 text-white">Producto</th>
              <th className="px-8 py-6">Talle / Variantes</th>
              <th className="px-8 py-6 text-right text-emerald-500">Precio Venta</th>
              <th className="px-8 py-6 text-right">Stock Total</th>
              <th className="px-8 py-6 text-right text-amber-500/80">Precio Costo</th>
              <th className="px-8 py-6">Categoría</th>
              <th className="px-8 py-6">Proveedor</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/50">
            {garments?.map((item: any) => {
              const totalStock = item.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
              return (
                <tr key={item.id} className="hover:bg-amber-500/[0.01] transition-all group text-sm">
                  <td className="px-8 py-5 font-mono text-[10px] text-neutral-600">
                    {item.variants?.[0]?.sku || "---"}
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-white uppercase tracking-tighter italic text-base leading-none">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {item.variants?.map((v: any) => (
                        <div key={v.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900/50 border border-neutral-800">
                          <span className="text-[9px] font-black text-white uppercase">{v.size?.value || "S/T"}</span>
                          {v.color && (
                            <div className="flex items-center gap-1 border-l border-neutral-700 pl-1.5 ml-0.5">
                              <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-tighter">{v.color.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-emerald-500">
                    ${Number(item.price).toLocaleString('es-AR')}
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-bold">
                    <span className={totalStock <= 0 ? 'text-red-500' : 'text-white'}>{totalStock}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-neutral-500">
                    ${Number(item.cost || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 text-[9px] font-black uppercase tracking-widest">{item.category?.name || "Gral"}</span>
                  </td>
                  <td className="px-8 py-5">
                    {item.supplier ? (
                      <button onClick={() => setSelectedProvider(item.supplier)} className="text-amber-500/60 hover:text-amber-500 transition-all text-[11px] font-black uppercase italic tracking-tight underline-offset-4 hover:underline">
                        {item.supplier.name}
                      </button>
                    ) : (
                      <span className="text-neutral-800 text-[10px] uppercase font-bold italic">Sin Asignar</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-4">
                      <ProductModal garment={item} categories={categories} sizes={sizeTypes} providers={providers} colors={colors || []} />
                      <button onClick={() => handleDelete(item.id, item.name)} className="text-neutral-700 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedProvider && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 rounded-t-full" />
            <button onClick={() => setSelectedProvider(null)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="mb-6">
              <Truck className="text-amber-500 mb-2" size={20} />
              <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">{selectedProvider.name}</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-[11px] text-neutral-400 uppercase font-bold italic">
                {selectedProvider.details || "Sin descripción disponible."}
              </div>
              <div className="grid gap-2">
                {selectedProvider.contacts?.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 bg-black p-3 rounded-xl border border-neutral-900">
                    <div className="text-amber-500">
                      {c.type === "EMAIL" ? <Mail size={14}/> : <Phone size={14}/>}
                    </div>
                    <span className="text-[11px] font-bold text-neutral-300">{c.contact}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedProvider(null)} className="w-full mt-8 py-3 rounded-xl bg-neutral-900 text-neutral-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </>
  );
}