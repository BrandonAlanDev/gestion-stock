import { getBoardAdminOptions } from "@/actions/admin-personalizado";
import { Wrench, Tag, Layers, Waves, FileText, LayoutTemplate, Settings2 } from "lucide-react";

import BoardTypesList from "@/components/admin-personalizado/BoardTypesList";

import ManageBoardTypeModal from "@/components/admin-personalizado/ManageBoardTypeModal";
import ManageTailModal from "@/components/admin-personalizado/ManageTailModal";
import ManageFinModal from "@/components/admin-personalizado/ManageFinModal";
import ManageFinConfigModal from "@/components/admin-personalizado/ManageFinConfigModal";
import ManageMaterialModal from "@/components/admin-personalizado/ManageMaterialModal";

export const dynamic = "force-dynamic";

export default async function AdminPersonalizadoPage() {
  const { data, success } = await getBoardAdminOptions();
  
  if (!success || !data) {
    return <div className="p-8 pt-24 text-red-500 font-bold text-center">Error cargando configuraciones.</div>;
  }

  const { types, tails, fins, configs, materials } = data;

  return (
    <div className="p-6 sm:p-8 w-full" style={{ background: "#f0fafa", color: "#0d2b2e" }}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase italic flex items-center gap-3" style={{ color: "#083d42" }}>
            <Wrench style={{ color: "#0d5c63" }} />
            Config. Personalizado
          </h1>
          <p className="text-[10px] font-black uppercase mt-1" style={{ color: "#4a7c80", letterSpacing: "0.4em" }}>
            Gestión de opciones para tablas a medida
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: MODELOS DE TABLA (Toma más espacio o es principal) */}
        <div className="lg:col-span-2 space-y-6">
          <BoardTypesList types={types} tails={tails} fins={fins} configs={configs} />

          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: "#ffffff", border: "1px solid #b2dede" }}>
            <div className="flex justify-between items-center mb-6 border-b border-[#e0f5f5] pb-4">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: "#083d42" }}>
                <FileText size={20} style={{ color: "#0d5c63" }} /> Materiales
              </h2>
              <ManageMaterialModal />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.length === 0 && <p className="text-sm italic text-[#4a7c80]">No hay materiales.</p>}
              {materials.map((mat: any) => (
                <div key={mat.id} className="p-4 rounded-[1.0rem] flex justify-between items-center" style={{ background: "#f0fafa", border: "1px solid #b2dede" }}>
                  <div>
                    <h3 className="text-sm font-black uppercase" style={{ color: "#083d42" }}>{mat.name}</h3>
                    {mat.description && <p className="text-[10px] text-[#4a7c80] mt-1">{mat.description}</p>}
                  </div>
                  <ManageMaterialModal material={mat} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: ATRIBUTOS (Colas, Sistemas, Configs) */}
        <div className="space-y-6">
          
          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: "#ffffff", border: "1px solid #b2dede" }}>
            <div className="flex justify-between items-center mb-6 border-b border-[#e0f5f5] pb-4">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: "#083d42" }}>
                <Waves size={20} style={{ color: "#0d5c63" }} /> Colas
              </h2>
              <ManageTailModal />
            </div>
            <div className="space-y-3">
              {tails.length === 0 && <p className="text-sm italic text-[#4a7c80]">No hay colas.</p>}
              {tails.map((tail: any) => (
                <div key={tail.id} className="flex justify-between items-center p-3 rounded-[1.0rem]" style={{ background: "#f0fafa", border: "1px solid #b2dede" }}>
                  <span className="text-xs font-bold uppercase text-[#0d2b2e]">{tail.name}</span>
                  <ManageTailModal tail={tail} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: "#ffffff", border: "1px solid #b2dede" }}>
            <div className="flex justify-between items-center mb-6 border-b border-[#e0f5f5] pb-4">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: "#083d42" }}>
                <Settings2 size={20} style={{ color: "#0d5c63" }} /> Sistemas de Quillas
              </h2>
              <ManageFinModal />
            </div>
            <div className="space-y-3">
              {fins.length === 0 && <p className="text-sm italic text-[#4a7c80]">No hay sistemas.</p>}
              {fins.map((fin: any) => (
                <div key={fin.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: "#f0fafa", border: "1px solid #b2dede" }}>
                  <span className="text-xs font-bold uppercase text-[#0d2b2e]">{fin.name}</span>
                  <ManageFinModal fin={fin} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-[1.0rem]" style={{ background: "#ffffff", border: "1px solid #b2dede" }}>
            <div className="flex justify-between items-center mb-6 border-b border-[#e0f5f5] pb-4">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-2" style={{ color: "#083d42" }}>
                <Layers size={20} style={{ color: "#0d5c63" }} /> Configs. Quillas
              </h2>
              <ManageFinConfigModal />
            </div>
            <div className="space-y-3">
              {configs.length === 0 && <p className="text-sm italic text-[#4a7c80]">No hay configs.</p>}
              {configs.map((conf: any) => (
                <div key={conf.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: "#f0fafa", border: "1px solid #b2dede" }}>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#0d2b2e]">{conf.name}</p>
                    <p className="text-[10px] text-[#4ab8b8] font-black uppercase tracking-widest">{conf.count} Quillas</p>
                  </div>
                  <ManageFinConfigModal config={conf} />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
