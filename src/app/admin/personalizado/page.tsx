import { getBoardAdminOptions } from "@/actions/admin-personalizado";
import { Wrench, Layers, Waves, FileText, Settings2, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getContrastColor } from "@/lib/utils";

import BoardTypesList from "@/components/admin-personalizado/BoardTypesList";
import ManageTailModal from "@/components/admin-personalizado/ManageTailModal";
import ManageFinModal from "@/components/admin-personalizado/ManageFinModal";
import ManageFinConfigModal from "@/components/admin-personalizado/ManageFinConfigModal";
import ManageMaterialModal from "@/components/admin-personalizado/ManageMaterialModal";
import ManageDeliveryModal from "@/components/admin-personalizado/ManageDeliveryModal";
import type { DatosPersonalizado } from "@/types/personalizado";

export const dynamic = "force-dynamic";

export default async function AdminPersonalizadoPage() {
  // Obtenemos la configuración directamente en el servidor
  const config = await prisma.pageConfig.findFirst();

  // Validación de seguridad: si es false, redirigimos inmediatamente
  if (config?.personalizadoEnabled === false) {
    redirect("/");
  }

  const { data, success } = await getBoardAdminOptions();
  
  if (!success || !data) {
    return <div className="p-8 pt-24 text-red-500 font-bold text-center">Error cargando configuraciones.</div>;
  }

  const background = config?.secondaryColor || "#00b4d8";
  const accent = config?.primaryColor || "#FFFFFF";
  const textColor = getContrastColor(background);
  const isDarkBg = textColor === "#ffffff";
  const cardBg = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const subCardBg = isDarkBg ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)";
  const borderColor = textColor + "2E";
  const softBorder = textColor + "1A";
  const mutedText = textColor + "99";

  const { types, tails, fins, configs, materials, deliveryOptions }: DatosPersonalizado = data;

  return (
    <div className=" p-6 sm:p-8 w-full mt-12" style={{ background, color: textColor }}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase italic flex items-center gap-3" style={{ color: accent }}>
            <Wrench style={{ color: accent }} />
            Config. Personalizado
          </h1>
          <p className="text-[10px] font-black uppercase mt-1" style={{ color: mutedText, letterSpacing: "0.4em" }}>
            Gestión de opciones para tablas a medida
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: MODELOS DE TABLA (Toma más espacio o es principal) */}
        <div className="lg:col-span-2 space-y-6">
          <BoardTypesList types={types} tails={tails} fins={fins} configs={configs} />

          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: softBorder }}>
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: accent }}>
                <FileText size={20} style={{ color: accent }} /> Materiales
              </h2>
              <ManageMaterialModal />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.length === 0 && <p className="text-sm italic" style={{ color: mutedText }}>No hay materiales.</p>}
              {materials.map((mat) => (
                <div key={mat.id} className="p-4 rounded-[1.0rem] flex justify-between items-center gap-3" style={{ background: subCardBg, border: `1px solid ${borderColor}` }}>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black uppercase" style={{ color: accent }}>{mat.name}</h3>
                    {mat.description && <p className="text-[10px] mt-1" style={{ color: mutedText }}>{mat.description}</p>}
                  </div>
                  <ManageMaterialModal material={mat} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: ATRIBUTOS (Colas, Sistemas, Configs) */}
        <div className="space-y-6">
          
          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: softBorder }}>
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: accent }}>
                <Waves size={20} style={{ color: accent }} /> Colas
              </h2>
              <ManageTailModal />
            </div>
            <div className="space-y-3">
              {tails.length === 0 && <p className="text-sm italic" style={{ color: mutedText }}>No hay colas.</p>}
              {tails.map((tail) => (
                <div key={tail.id} className="flex justify-between items-center p-3 rounded-[1.0rem] gap-3" style={{ background: subCardBg, border: `1px solid ${borderColor}` }}>
                  <span className="text-xs font-bold uppercase min-w-0 truncate" style={{ color: textColor }}>{tail.name}</span>
                  <ManageTailModal tail={tail} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: softBorder }}>
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: accent }}>
                <Settings2 size={20} style={{ color: accent }} /> Sistemas de Quillas
              </h2>
              <ManageFinModal />
            </div>
            <div className="space-y-3">
              {fins.length === 0 && <p className="text-sm italic" style={{ color: mutedText }}>No hay sistemas.</p>}
              {fins.map((fin) => (
                <div key={fin.id} className="flex justify-between items-center p-3 rounded-xl gap-3" style={{ background: subCardBg, border: `1px solid ${borderColor}` }}>
                  <span className="text-xs font-bold uppercase min-w-0 truncate" style={{ color: textColor }}>{fin.name}</span>
                  <ManageFinModal fin={fin} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: softBorder }}>
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: accent }}>
                <Layers size={20} style={{ color: accent }} /> Configs. Quillas
              </h2>
              <ManageFinConfigModal />
            </div>
            <div className="space-y-3">
              {configs.length === 0 && <p className="text-sm italic" style={{ color: mutedText }}>No hay configs.</p>}
              {configs.map((conf) => (
                <div key={conf.id} className="flex justify-between items-center p-3 rounded-xl gap-3" style={{ background: subCardBg, border: `1px solid ${borderColor}` }}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase" style={{ color: textColor }}>{conf.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>{conf.count} Quillas</p>
                  </div>
                  <ManageFinConfigModal config={conf} />
                </div>
              ))}
            </div>
          </div>

          {/* TIEMPOS DE ENTREGA */}
          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: softBorder }}>
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: accent }}>
                <Clock size={20} style={{ color: accent }} /> Tiempos de Entrega
              </h2>
              <ManageDeliveryModal />
            </div>
            <div className="space-y-3">
              {deliveryOptions.length === 0 && <p className="text-sm italic" style={{ color: mutedText }}>No hay opciones de entrega.</p>}
              {deliveryOptions.map((d) => (
                <div key={d.id} className="flex justify-between items-center p-3 rounded-[1.0rem] gap-3" style={{ background: subCardBg, border: `1px solid ${borderColor}` }}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase" style={{ color: textColor }}>{d.label}</p>
                    {d.description && <p className="text-[10px] mt-1" style={{ color: mutedText }}>{d.description}</p>}
                    {!d.active && <p className="text-[10px] text-red-400 font-bold uppercase mt-1">Inactivo</p>}
                  </div>
                  <ManageDeliveryModal delivery={d} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
