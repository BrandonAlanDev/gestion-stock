"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle,
  ChevronDown
} from "lucide-react";

// --- DATOS TÉCNICOS DEL PLAN ---
const BENEFICIOS = [
  {
    icon: TrendingUp,
    title: "CUOTAS SIN INTERÉS",
    desc: "Financiación directa de fábrica. El valor de tu cuota se calcula de forma transparente sobre el valor móvil actualizado de tu unidad.",
  },
  {
    icon: ShieldCheck,
    title: "CONTRATO Y RESPALDO",
    desc: "Suscripciones formales bajo contratos regulados, garantizando sorteos y licitaciones mensuales con escribanos públicos.",
  },
  {
    icon: Layers,
    title: "ADCO NO ADJUDICADO",
    desc: "Flexibilidad de cancelación. Podés adelantar cuotas a costo puro, transferir la titularidad o dar de baja el plan sin costos ocultos.",
  },
];

const ETAPAS = [
  { step: "01", title: "Suscripción Digital", desc: "Elección del producto, validación legal y acreditación del primer pago mensual de ingreso." },
  { step: "02", title: "Fondo de Aportes", desc: "Pago mensual del 1 al 10 de cada mes, capitalizando tu cuota pura sin costos de interés financiero." },
  { step: "03", title: "Acto de Adjudicación", desc: "Asignación mensual de unidades por sorteo general del grupo o mediante oferta de licitación." },
  { step: "04", title: "Entrega y Configuración", desc: "Adjudicación completa del bien, configuración de detalles a medida en fábrica y entrega final." },
];

const FAQS = [
  {
    q: "¿Qué es el valor móvil y cómo influye en las cuotas?",
    a: "El valor móvil es el valor de lista actual de la unidad. Al cambiar de precio el producto, la cuota se actualiza porcentualmente sobre el valor del bien (Cuota Pura = Valor Móvil dividido los meses totales del plan), permitiendo que tus aportes mantengan siempre el valor adquisitivo real frente al mercado.",
  },
  {
    q: "¿Cómo funciona la adjudicación por licitación?",
    a: "La licitación te permite ofertar un adelanto de cuotas. El adherente que mayor cantidad de cuotas oferte dentro de su grupo resulta adjudicado ese mes, acelerando los tiempos tradicionales de retiro de la unidad.",
  },
  {
    q: "¿Puedo rescindir o suspender el plan antes de tiempo?",
    a: "Sí. Podés rescindir o suspender tu adhesión al plan en cualquier momento de forma formal. Los fondos acumulados netos de cargos administrativos preestablecidos son devueltos al concluir el ciclo de vida del grupo de ahorro.",
  },
];

export default function PlanAhorroPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="w-full min-h-screen bg-white text-black pt-24 uppercase tracking-wide selection:bg-cyan-400 selection:text-black">
      
      {/* 1. HERO INSTITUCIONAL */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 border-b-2 border-black">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black tracking-[0.4em] text-cyan-500 block mb-3">
              // CANAL DE FINANCIACIÓN DIRECTA DE FÁBRICA
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6 text-black">
              PLAN DE <br />AHORRO ADJUDICADO
            </h1>
            <p className="text-neutral-500 normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal">
              La alternativa de ahorro más sólida y transparente para programar la adquisición de equipamiento de alto rendimiento. Capitalización real mediante cuotas puras variables indexadas al valor del producto de fábrica.
            </p>
          </div>
          
          {/* Widget Comercial de Datos */}
          <div className="bg-neutral-50 border-2 border-black p-6 min-w-[280px] lg:min-w-[350px]">
            <div className="text-[9px] font-black text-neutral-400 mb-1">// INFORMACIÓN DE SUSCRIPCIÓN</div>
            <div className="text-lg font-black italic tracking-tighter text-black mb-4">GRUPOS ABIERTOS</div>
            <div className="space-y-2 text-[11px] font-black text-neutral-500">
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span>CUOTAS ESTIMADAS:</span>
                <span className="text-black">$15.000 /MES</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span>ADJUDICACIÓN MÍNIMA:</span>
                <span className="text-cyan-500 font-bold">MES 3</span>
              </div>
              <div className="flex justify-between">
                <span>SISTEMA DE INTERÉS:</span>
                <span className="text-black">0% FINANCIERO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PILARES FINANCIEROS */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-neutral-100">
        {BENEFICIOS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="bg-white p-8 border border-neutral-200 flex flex-col justify-between group hover:border-cyan-400 transition-colors duration-300">
              <div>
                <div className="w-10 h-10 border border-black bg-black flex items-center justify-center text-cyan-400 mb-6">
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-lg tracking-tight mb-3 text-black italic">{b.title}</h3>
                <p className="text-neutral-500 normal-case tracking-normal font-medium text-xs leading-relaxed">
                  {b.desc}
                </p>
              </div>
              <div className="text-[9px] font-mono font-black text-neutral-300 mt-8">// REF_COD_0{i+1}</div>
            </div>
          );
        })}
      </section>

      {/* 3. LÍNEA DE PROCESO */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 border-t border-neutral-200 bg-white">
        <div className="mb-12 border-b border-neutral-100 pb-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-neutral-400">// OPERATORIA CONTRACTUAL</span>
          <h2 className="text-3xl font-black tracking-tighter italic text-black">PASOS DE SUSCRIPCIÓN Y RETIRO</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ETAPAS.map((e, i) => (
            <div key={i} className="bg-neutral-50 border border-neutral-200 p-6 flex flex-col justify-between">
              <div>
                <span className="text-4xl font-black italic tracking-tighter text-cyan-500 block mb-4">// {e.step}</span>
                <h4 className="font-black text-sm tracking-tight text-black mb-2">{e.title}</h4>
                <p className="text-neutral-500 normal-case tracking-normal text-xs font-medium leading-normal">{e.desc}</p>
              </div>
              <div className="flex justify-end mt-6">
                <CheckCircle2 className="w-4 h-4 text-neutral-300" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PREGUNTAS FRECUENTES (CONTRATOS) */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-cyan-500">// CONSULTAS DE MARCO LEGAL</span>
            <h2 className="text-3xl font-black tracking-tighter italic text-black mb-4">CONDICIONES CONTRACTUALES</h2>
            <p className="text-neutral-500 normal-case text-xs font-medium tracking-normal leading-relaxed">
              Revisá los puntos clave de las normativas de fondos adjudicados y reglamentos de suscripción abierta. Solicitá el contrato marco completo por vía de contacto comercial.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-neutral-200 bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-black text-xs tracking-wide text-black hover:text-cyan-500 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-cyan-500" : ""}`} />
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === idx ? "auto" : 0 }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div className="p-5 pt-0 border-t border-neutral-100 text-neutral-500 normal-case font-medium text-xs tracking-normal leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA DE ADHESIÓN */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 bg-black text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-2 border-cyan-500">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none mb-1 text-white">ADHERIRSE AL PROGRAMA</h2>
          <p className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Iniciá tu suscripción digital directa con cuota fija inicial.</p>
        </div>
        
        <button className="bg-cyan-400 text-black px-8 py-4 text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 border border-cyan-400 flex items-center gap-3 shrink-0">
          SOLICITAR ADHESIÓN <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </section>

    </main>
  );
}