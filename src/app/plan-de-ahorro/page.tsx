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

// --- CONFIGURACIÓN DE WHATSAPP ---
const WHATSAPP_NUMBER = "5491123456789";
const WHATSAPP_MESSAGE = "¡Hola! Me interesa sumarme al Plan de Ahorro Surf. Me gustaría que me asesoren: estoy buscando una tabla tipo [escribir acá] y mi idea sería financiarla en [3 o 6] cuotas.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// --- DATOS TÉCNICOS ADAPTADOS AL PLAN SURF ---
const BENEFICIOS = [
  {
    icon: TrendingUp,
    title: "100% SIN INTERÉS",
    desc: "Financiación directa de fábrica. Sin bancos ni intermediarios financieros. El valor de tu tabla dividido en cuotas transparentes.",
  },
  {
    icon: ShieldCheck,
    title: "TRAYECTORIA REAL",
    desc: "Contamos con varios años de experiencia implementando esta modalidad y ya entregamos más de 100 tablas bajo nuestro Plan de Ahorro.",
  },
  {
    icon: Layers,
    title: "PARA TODO SURFER",
    desc: "Diseñado a medida tanto si estás buscando equiparte con tu primera tabla como si querés ampliar tu quiver actual.",
  },
];

const ETAPAS = [
  { step: "01", title: "Definición", desc: "Nos contás qué tipo de tabla buscás, si es tu primera tabla o si querés ampliar tu quiver." },
  { step: "02", title: "Suscripción", desc: "Elegís la cantidad de cuotas (3 o 6 meses) y armamos la planilla junto con tus datos." },
  { step: "03", title: "Aportes Mensuales", desc: "Abonás el valor de tus cuotas de manera cómoda dentro de los primeros 10 días de cada mes." },
  { step: "04", title: "Retiro o Envío", desc: "Una vez completado el total de las cuotas, retirás tu tabla de fábrica o te la enviamos adonde estés." },
];

const FAQS = [
  {
    q: "¿En cuántas cuotas puedo financiar mi próxima tabla?",
    a: "Podés elegir financiar tu New Surfboards de manera directa en 3 o 6 cuotas mensuales según lo que te quede más cómodo.",
  },
  {
    q: "¿Cuándo y cómo se realizan los pagos?",
    a: "Los pagos se realizan mensualmente. Tenés tiempo de abonar el valor de tu cuota dentro de los primeros 10 días de cada mes.",
  },
  {
    q: "¿Qué pasa si no vivo cerca de la fábrica para retirarla?",
    a: "No te preocupes por la distancia. Hacemos envíos a todo el país para que tu tabla llegue directo a tus manos lista para ir al agua.",
  },
];

export default function PlanAhorroPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="w-full min-h-screen bg-white pt-24 uppercase tracking-wide selection:bg-cyan-50 selection:text-cyan-500">

      {/* 1. HERO INSTITUCIONAL */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3 text-cyan-500">
              // FINANCIACIÓN DIRECTA DE FÁBRICA SIN INTERMEDIARIOS
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6 text-neutral-900">
              PLAN DE <br /><span className="text-cyan-500">AHORRO SURF</span>
            </h1>
            <p className="normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal text-neutral-500">
              Si tenés que ampliar tu quiver o querés comprar tu primera tabla, este plan es para vos. Con varios años de trayectoria y más de 100 tablas entregadas con el plan, te financiamos directo desde fábrica sin vueltas ni intereses.
            </p>
          </div>

          {/* Widget Comercial de Datos */}
          <div className="bg-white border border-neutral-200 p-6 min-w-[280px] lg:min-w-[350px]" style={{ borderRadius: "24px" }}>
            <div className="text-[9px] font-black mb-1 text-neutral-400">// INFORMACIÓN DE SUSCRIPCIÓN</div>
            <div className="text-lg font-black italic tracking-tighter mb-4 text-neutral-800">PLANES ABIERTOS</div>
            <div className="space-y-2 text-[11px] font-black text-neutral-500">
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span>OPCIONES DE FINANCIACIÓN:</span>
                <span className="text-neutral-800">3 O 6 CUOTAS</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span>PAGO MENSUAL:</span>
                <span className="font-bold text-cyan-500">DEL 1 AL 10</span>
              </div>
              <div className="flex justify-between">
                <span>INTERÉS COMERCIAL:</span>
                <span className="text-cyan-500">0% INTERÉS GENERAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PILARES DEL PLAN */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
        {BENEFICIOS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="p-8 border border-neutral-200 bg-white flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300"
              style={{ borderRadius: "24px" }}
            >
              <div>
                <div className="w-10 h-10 flex items-center justify-center mb-6 bg-cyan-50 text-cyan-500" style={{ borderRadius: "10px" }}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-lg tracking-tight mb-3 italic text-neutral-800">{b.title}</h3>
                <p className="normal-case tracking-normal font-medium text-xs leading-relaxed text-neutral-500">
                  {b.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. LÍNEA DE PROCESO */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white">
        <div className="mb-12 pb-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-neutral-400">// PASO A PASO</span>
          <h2 className="text-3xl font-black tracking-tighter italic text-neutral-800">¿CÓMO EMPEZÁS TU PRÓXIMA TABLA?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ETAPAS.map((e, i) => (
            <div
              key={i}
              className="p-6 flex flex-col justify-between shadow-sm border border-neutral-200 hover:shadow-lg hover:shadow-cyan-500/5 transition-all bg-white"
              style={{ borderRadius: "24px" }}
            >
              <div>
                <span className="text-4xl font-black italic tracking-tighter block mb-4 text-cyan-100">// {e.step}</span>
                <h4 className="font-black text-sm tracking-tight mb-2 text-neutral-800">{e.title}</h4>
                <p className="normal-case tracking-normal text-xs font-medium leading-normal text-neutral-500">{e.desc}</p>
              </div>
              <div className="flex justify-end mt-6">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PREGUNTAS FRECUENTES */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-cyan-500">// DESPEJÁ TUS DUDAS</span>
            <h2 className="text-3xl font-black tracking-tighter italic mb-4 text-neutral-800">PREGUNTAS FRECUENTES</h2>
            <p className="normal-case text-xs font-medium tracking-normal leading-relaxed text-neutral-500">
              Revisá los puntos clave de nuestro funcionamiento. Si tenés consultas personalizadas sobre el tipo de tabla, medidas o materiales, ponete en contacto directo con nosotros.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-neutral-200 transition-all shadow-sm bg-white"
                style={{ borderRadius: "16px" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-black text-xs tracking-wide transition-colors text-neutral-800"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 shrink-0 text-cyan-500" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300"
                    style={{
                      color: openFaq === idx ? "#06b6d4" : "#a3a3a3",
                      transform: openFaq === idx ? "rotate(180deg)" : "none"
                    }}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: openFaq === idx ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-5 pt-0 border-t border-neutral-100 normal-case font-medium text-xs tracking-normal leading-relaxed text-neutral-500"
                  >
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA DE ADHESIÓN */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none mb-1 text-neutral-800">¿QUÉ ESPERÁS PARA ANOTARTE?</h2>
          <p className="text-[10px] font-black tracking-widest uppercase text-cyan-500">Sumate hoy y le empezamos a dar forma a tu próxima New Surfboards.</p>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl cursor-pointer"
          style={{ background: "#06b6d4", borderRadius: "14px" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0891b2")}
          onMouseLeave={e => (e.currentTarget.style.background = "#06b6d4")}
        >
          ANOTARME EN EL PLAN <ArrowRight className="w-4 h-4 stroke-[3]" />
        </a>
      </section>

    </main>
  );
}