"use client";
import { Minus, Plus, Trash2, Settings } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartItemRow({ item, onEdit }: { item: any, onEdit: () => void }) {
    const { updateQty, removeItem } = useCart();
    const esTabla = item.esTabla;

    return (
        <div className="p-3 border rounded-xl flex gap-4 bg-white/50">
            <Image src={item.image || "/placeholder.png"} alt={item.name} width={60} height={60} className="rounded-lg object-cover" />
            <div className="flex-1">
                <h3 className="font-bold text-sm truncate">{item.name}</h3>
                {esTabla && (
                    <button onClick={onEdit} className="text-[10px] flex items-center gap-1 opacity-60 hover:text-blue-500">
                        <Settings size={10} /> {item.specs ? "Editar Specs" : "Configurar"}
                    </button>
                )}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.uid, -1)} className="p-1 rounded bg-black/5"><Minus size={10} /></button>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.uid, 1)} className="p-1 rounded bg-black/5"><Plus size={10} /></button>
                    </div>
                    <button onClick={() => removeItem(item.uid)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}