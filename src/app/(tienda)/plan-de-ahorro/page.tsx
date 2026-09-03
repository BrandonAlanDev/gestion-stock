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
    <main className="w-full min-h-screen bg-[var(--color-fondo-sitio)] text-[var(--texto-sobre-fondo)] pt-24 uppercase tracking-wide selection:bg-[var(--color-primario)] selection:text-[var(--texto-sobre-primario)]">

      {/* 1. HERO INSTITUCIONAL */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 bg-[var(--color-fondo-sitio)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3 text-[var(--color-primario)]">
              {"// "}FINANCIACIÓN DIRECTA DE FÁBRICA SIN INTERMEDIARIOS
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6 text-[var(--texto-sobre-fondo)]">
              PLAN DE <br /><span className="text-[var(--color-primario)]">AHORRO SURF</span>
            </h1>
            <p className="normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal text-[var(--texto-sobre-fondo)]/60">
              Si tenés que ampliar tu quiver o querés comprar tu primera tabla, este plan es para vos. Con varios años de trayectoria y más de 100 tablas entregadas con el plan, te financiamos directo desde fábrica sin vueltas ni intereses.
            </p>
          </div>

          {/* Widget Comercial de Datos */}
          <div className="bg-[var(--color-secundario)] border border-[color-mix(in_srgb,var(--color-primario)_15%,transparent)] p-6 min-w-[280px] lg:min-w-[350px]" style={{ borderRadius: "24px" }}>
            <div className="text-[9px] font-black mb-1 text-[var(--texto-sobre-secundario)]/50">{"// "}INFORMACIÓN DE SUSCRIPCIÓN</div>
            <div className="text-lg font-black italic tracking-tighter mb-4 text-[var(--texto-sobre-secundario)]">PLANES ABIERTOS</div>
            <div className="space-y-2 text-[11px] font-black text-[var(--texto-sobre-secundario)]/60">
              <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--color-primario)_8%,transparent)] pb-1">
                <span>OPCIONES DE FINANCIACIÓN:</span>
                <span className="text-[var(--texto-sobre-secundario)]">3 O 6 CUOTAS</span>
              </div>
              <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--color-primario)_8%,transparent)] pb-1">
                <span>PAGO MENSUAL:</span>
                <span className="font-bold text-[var(--color-primario)]">DEL 1 AL 10</span>
              </div>
              <div className="flex justify-between">
                <span>INTERÉS COMERCIAL:</span>
                <span className="text-[var(--color-primario)]">0% INTERÉS GENERAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PILARES DEL PLAN */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--color-fondo-sitio)]">
        {BENEFICIOS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="p-8 border border-[color-mix(in_srgb,var(--color-primario)_15%,transparent)] bg-[var(--color-secundario)] flex flex-col justify-between group shadow-sm hover:shadow-[0_20px_25px_-5px_color-mix(in_srgb,var(--color-primario)_10%,transparent)] transition-all duration-300"
              style={{ borderRadius: "24px" }}
            >
              <div>
                <div className="w-10 h-10 flex items-center justify-center mb-6 bg-[color-mix(in_srgb,var(--color-primario)_12%,transparent)] text-[var(--color-primario)]" style={{ borderRadius: "10px" }}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-lg tracking-tight mb-3 italic text-[var(--texto-sobre-secundario)]">{b.title}</h3>
                <p className="normal-case tracking-normal font-medium text-xs leading-relaxed text-[var(--texto-sobre-secundario)]/60">
                  {b.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. LÍNEA DE PROCESO */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-[var(--color-fondo-sitio)]">
        <div className="mb-12 pb-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-[var(--texto-sobre-fondo)]/50">{"// "}PASO A PASO</span>
          <h2 className="text-3xl font-black tracking-tighter italic text-[var(--texto-sobre-fondo)]">¿CÓMO EMPEZÁS TU PRÓXIMA TABLA?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ETAPAS.map((e, i) => (
            <div
              key={i}
              className="p-6 flex flex-col justify-between shadow-sm border border-[color-mix(in_srgb,var(--color-primario)_15%,transparent)] hover:shadow-[0_10px_15px_-3px_color-mix(in_srgb,var(--color-primario)_10%,transparent)] transition-all bg-[var(--color-secundario)]"
              style={{ borderRadius: "24px" }}
            >
              <div>
                <span className="text-4xl font-black italic tracking-tighter block mb-4 text-[color-mix(in_srgb,var(--color-primario)_30%,transparent)]">{"// "}{e.step}</span>
                <h4 className="font-black text-sm tracking-tight mb-2 text-[var(--texto-sobre-secundario)]">{e.title}</h4>
                <p className="normal-case tracking-normal text-xs font-medium leading-normal text-[var(--texto-sobre-secundario)]/60">{e.desc}</p>
              </div>
              <div className="flex justify-end mt-6">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-primario)]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PREGUNTAS FRECUENTES */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-[var(--color-fondo-sitio)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--color-primario)]">{"// "}DESPEJÁ TUS DUDAS</span>
            <h2 className="text-3xl font-black tracking-tighter italic mb-4 text-[var(--texto-sobre-fondo)]">PREGUNTAS FRECUENTES</h2>
            <p className="normal-case text-xs font-medium tracking-normal leading-relaxed text-[var(--texto-sobre-fondo)]/60">
              Revisá los puntos clave de nuestro funcionamiento. Si tenés consultas personalizadas sobre el tipo de tabla, medidas o materiales, ponete en contacto directo con nosotros.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[color-mix(in_srgb,var(--color-primario)_15%,transparent)] transition-all shadow-sm bg-[var(--color-secundario)]"
                style={{ borderRadius: "16px" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-black text-xs tracking-wide transition-colors cursor-pointer text-[var(--texto-sobre-secundario)]"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 shrink-0 text-[var(--color-primario)]" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300"
                    style={{
                      color: openFaq === idx ? "var(--color-primario)" : "color-mix(in srgb, var(--texto-sobre-secundario) 60%, transparent)",
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
                    className="p-5 pt-0 border-t border-[color-mix(in_srgb,var(--color-primario)_8%,transparent)] normal-case font-medium text-xs tracking-normal leading-relaxed text-[var(--texto-sobre-secundario)]/60"
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
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--color-fondo-sitio)]">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none mb-1 text-[var(--texto-sobre-fondo)]">¿QUÉ ESPERÁS PARA ANOTARTE?</h2>
          <p className="text-[10px] font-black tracking-widest uppercase text-[var(--color-primario)]">Sumate hoy y le empezamos a dar forma a tu próxima New Surfboards.</p>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl hover:opacity-90 cursor-pointer bg-[var(--color-primario)] text-[var(--texto-sobre-primario)]"
          style={{ borderRadius: "14px" }}
        >
          ANOTARME EN EL PLAN <ArrowRight className="w-4 h-4 stroke-[3]" />
        </a>
      </section>

    </main>
  );
}
