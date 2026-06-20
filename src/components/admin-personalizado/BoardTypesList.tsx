"use client";

import { useState } from "react";
import { LayoutTemplate, Waves, Settings2, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import ManageBoardTypeModal from "./ManageBoardTypeModal";

interface BoardTypesListProps {
  types: any[];
  tails: any[];
  fins: any[];
  configs: any[];
}

const ITEMS_PER_PAGE = 3;

export default function BoardTypesList({ types, tails, fins, configs }: BoardTypesListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(types.length / ITEMS_PER_PAGE);
  
  // Ensure current page is valid after deletions
  const safePage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const currentItems = types.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col p-6 rounded-[2.5rem]" style={{ background: "#ffffff", border: "1px solid #b2dede" }}>
      <div className="flex justify-between items-center mb-6 border-b border-[#e0f5f5] pb-4">
        <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: "#083d42" }}>
          <LayoutTemplate size={20} style={{ color: "#0d5c63" }} /> Modelos de Tabla
        </h2>
        <ManageBoardTypeModal availableTails={tails} availableFins={fins} availableConfigs={configs} />
      </div>
      
      <div className="space-y-4">
        {types.length === 0 && <p className="text-sm italic text-[#4a7c80]">No hay modelos configurados.</p>}
        {currentItems.map((type: any) => (
          <div key={type.id} className="p-5 rounded-2xl border" style={{ background: "#f0fafa", borderColor: "#b2dede" }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black uppercase" style={{ color: "#083d42" }}>{type.name}</h3>
                {type.svgPath && <p className="text-[10px] text-[#4a7c80] uppercase tracking-widest mt-1">Con Imagen (SVG)</p>}
              </div>
              <ManageBoardTypeModal boardType={type} availableTails={tails} availableFins={fins} availableConfigs={configs} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white p-3 rounded-xl border border-[#e0f5f5]">
                <span className="text-[9px] font-black uppercase text-[#4a7c80] flex items-center gap-1 mb-2"><Waves size={10} /> Colas</span>
                <div className="flex flex-wrap gap-1">
                  {type.allowedTails.map((t: any) => <span key={t.id} className="text-[10px] bg-[#0d5c63]/10 text-[#0d5c63] px-2 py-1 rounded-md font-bold">{t.name}</span>)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#e0f5f5]">
                <span className="text-[9px] font-black uppercase text-[#4a7c80] flex items-center gap-1 mb-2"><Settings2 size={10} /> Sistemas</span>
                <div className="flex flex-wrap gap-1">
                  {type.allowedFins.map((f: any) => <span key={f.id} className="text-[10px] bg-[#0d5c63]/10 text-[#0d5c63] px-2 py-1 rounded-md font-bold">{f.name}</span>)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#e0f5f5]">
                <span className="text-[9px] font-black uppercase text-[#4a7c80] flex items-center gap-1 mb-2"><Layers size={10} /> Configs</span>
                <div className="flex flex-wrap gap-1">
                  {type.allowedConfigs.map((c: any) => <span key={c.id} className="text-[10px] bg-[#0d5c63]/10 text-[#0d5c63] px-2 py-1 rounded-md font-bold">{c.name}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[#e0f5f5]">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 rounded-xl border border-[#b2dede] text-[#0d5c63] bg-[#f0fafa] disabled:opacity-50 hover:bg-[#e0f5f5] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-xs font-black text-[#083d42]">
            Página {safePage} de {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 rounded-xl border border-[#b2dede] text-[#0d5c63] bg-[#f0fafa] disabled:opacity-50 hover:bg-[#e0f5f5] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
