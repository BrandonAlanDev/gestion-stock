"use client";

import { useState } from "react";
import { LayoutTemplate, Waves, Settings2, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
import ManageBoardTypeModal from "./ManageBoardTypeModal";
import type {
  ModeloTabla,
  ColaTabla,
  QuillaTabla,
  ConfigQuillaTabla,
} from "@/types/personalizado";

interface BoardTypesListProps {
  types: ModeloTabla[];
  tails: ColaTabla[];
  fins: QuillaTabla[];
  configs: ConfigQuillaTabla[];
}

const ITEMS_PER_PAGE = 3;

export default function BoardTypesList({ types, tails, fins, configs }: BoardTypesListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const isDarkBg = textColor === "#ffffff";
  const cardBg = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const subCardBg = isDarkBg ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)";
  const innerBg = isDarkBg ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.12)";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const hoverBg = isDarkBg ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)";
  const borderColor = textColor + "2E";
  const softBorder = textColor + "1A";
  const mutedText = textColor + "99";
  const chipBg = accent + "1A";

  const totalPages = Math.ceil(types.length / ITEMS_PER_PAGE);
  
  // Ensure current page is valid after deletions
  const safePage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const currentItems = types.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: softBorder }}>
        <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: accent }}>
          <LayoutTemplate size={20} style={{ color: accent }} /> Modelos de Tabla
        </h2>
        <ManageBoardTypeModal availableTails={tails} availableFins={fins} availableConfigs={configs} />
      </div>
      
      <div className="space-y-4">
        {types.length === 0 && <p className="text-sm italic" style={{ color: mutedText }}>No hay modelos configurados.</p>}
        {currentItems.map((type) => (
          <div key={type.id} className="p-5 rounded-[1.0rem] border" style={{ background: subCardBg, borderColor }}>
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-black uppercase" style={{ color: accent }}>{type.name}</h3>
                {type.svgPath && <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: mutedText }}>Con Imagen (SVG)</p>}
              </div>
              <ManageBoardTypeModal boardType={type} availableTails={tails} availableFins={fins} availableConfigs={configs} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-[1.0rem] border" style={{ background: innerBg, borderColor: softBorder }}>
                <span className="text-[9px] font-black uppercase flex items-center gap-1 mb-2" style={{ color: mutedText }}><Waves size={10} /> Colas</span>
                <div className="flex flex-wrap gap-1">
                  {type.allowedTails.map((t) => <span key={t.id} className="text-[10px] px-2 py-1 rounded-md font-bold" style={{ background: chipBg, color: accent }}>{t.name}</span>)}
                </div>
              </div>
              <div className="p-3 rounded-[1.0rem] border" style={{ background: innerBg, borderColor: softBorder }}>
                <span className="text-[9px] font-black uppercase flex items-center gap-1 mb-2" style={{ color: mutedText }}><Settings2 size={10} /> Sistemas</span>
                <div className="flex flex-wrap gap-1">
                  {type.allowedFins.map((f) => <span key={f.id} className="text-[10px] px-2 py-1 rounded-md font-bold" style={{ background: chipBg, color: accent }}>{f.name}</span>)}
                </div>
              </div>
              <div className="p-3 rounded-[1.0rem] border" style={{ background: innerBg, borderColor: softBorder }}>
                <span className="text-[9px] font-black uppercase flex items-center gap-1 mb-2" style={{ color: mutedText }}><Layers size={10} /> Configs</span>
                <div className="flex flex-wrap gap-1">
                  {type.allowedConfigs.map((c) => <span key={c.id} className="text-[10px] px-2 py-1 rounded-md font-bold" style={{ background: chipBg, color: accent }}>{c.name}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t" style={{ borderColor: softBorder }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 rounded-xl border disabled:opacity-50 transition-colors hover:bg-[var(--hover-bg)]"
            style={{ borderColor, color: accent, background: inputBg, "--hover-bg": hoverBg } as React.CSSProperties}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-xs font-black" style={{ color: textColor }}>
            Página {safePage} de {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 rounded-xl border disabled:opacity-50 transition-colors hover:bg-[var(--hover-bg)]"
            style={{ borderColor, color: accent, background: inputBg, "--hover-bg": hoverBg } as React.CSSProperties}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
