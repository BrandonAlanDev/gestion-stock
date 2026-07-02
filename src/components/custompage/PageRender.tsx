"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { usePageConfig } from "../providers/PageConfigProvider";
import LocationCard from "../ui/LocationCard";

// --- INTERFACES BASADAS EN TU PRISMA SCHEMA ---
export interface CustomItem {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  link?: string | null;
  order: number;
  config?: any;
}

export interface CustomSection {
  id: string;
  type: "HERO" | "TEXT" | "CARDS" | "FAQ" | "TIMELINE" | "CTA" | "GALLERY" | "FEATURES";
  title?: string | null;
  subtitle?: string | null;
  order: number;
  config?: any;
  items: CustomItem[];
}

export interface CustomPage {
  slug: string;
  title: string;
  subtitle?: string | null;
  sections: CustomSection[];
}

// Helper para renderizar iconos dinámicos guardados como texto (ej: "TrendingUp")
const DynamicIcon = ({ name, className, style }: { name?: string | null, className?: string, style?: any }) => {
  if (!name) return null;
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} style={style} />;
};

export default function PageRenderer({ page }: { page: CustomPage }) {
  return (
    <main className="w-full min-h-screen bg-white pt-24 uppercase tracking-wide selection:bg-[#f0fafa] selection:text-[#0d5c63]">
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}

// Ruteador de Secciones
function SectionRenderer({ section }: { section: CustomSection }) {
  switch (section.type) {
    case "HERO":
      return <HeroSection section={section} />;
    case "FEATURES":
      return <FeaturesSection section={section} />;
    case "CARDS":
      return <CardsSection section={section} />;
    case "TIMELINE":
      return <TimelineSection section={section} />;
    case "FAQ":
      return <FaqSection section={section} />;
    case "CTA":
      return <CtaSection section={section} />;
    default:
      return null;
  }
}

// 1. HERO INSTITUCIONAL
function HeroSection({ section }: { section: CustomSection }) {
  // El config puede traer datos del widget lateral
  const widget = section.config?.widget;
  
  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 border-b-2" style={{ borderColor: "#b2dede" }}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-4xl">
          {section.config?.overline && (
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3" style={{ color: "#0d5c63" }}>
              // {section.config.overline}
            </span>
          )}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6" style={{ color: "#0d5c63" }}>
            {section.title}
          </h1>
          {section.subtitle && (
            <p className="normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal" style={{ color: "#4a7c80" }}>
              {section.subtitle}
            </p>
          )}
        </div>
        
        {/* Renderiza el widget si existe en la configuración (Ej: Widget de Plan de Ahorro) */}
        {widget && (
          <div className="bg-[#ffffff] border-2 p-6 min-w-[280px] lg:min-w-[350px]" style={{ borderColor: "#b2dede", borderRadius: "24px" }}>
            <div className="text-[9px] font-black mb-1" style={{ color: "#4a7c80" }}>// {widget.overline}</div>
            <div className="text-lg font-black italic tracking-tighter mb-4" style={{ color: "#083d42" }}>{widget.title}</div>
            <div className="space-y-2 text-[11px] font-black" style={{ color: "#4a7c80" }}>
              {widget.rows?.map((row: any, i: number) => (
                <div key={i} className={`flex justify-between ${i !== widget.rows.length - 1 ? 'border-b pb-1' : ''}`} style={{ borderColor: "#f0fafa" }}>
                  <span>{row.label}</span>
                  <span className={row.highlight ? "font-bold" : ""} style={{ color: row.highlight ? "#0d5c63" : "#083d42" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// 2. FEATURES (Pilares del plan - Grid normal)
function FeaturesSection({ section }: { section: CustomSection }) {
  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
      {section.items.map((item) => (
        <div 
          key={item.id} 
          className="p-8 border flex flex-col justify-between group shadow-md hover:shadow-xl transition-all duration-300"
          style={{ background: "#ffffff", borderColor: "#b2dede", borderRadius: "24px" }}
        >
          <div>
            <div className="w-10 h-10 flex items-center justify-center mb-6" style={{ background: "#f0fafa", color: "#0d5c63", borderRadius: "10px" }}>
              <DynamicIcon name={item.icon} className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-lg tracking-tight mb-3 italic" style={{ color: "#083d42" }}>{item.title}</h3>
            <p className="normal-case tracking-normal font-medium text-xs leading-relaxed" style={{ color: "#4a7c80" }}>
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

// 3. CARDS (Menú de soluciones - Scroll Horizontal opcional o Grid)
function CardsSection({ section }: { section: CustomSection }) {
  const isHorizontal = section.config?.style === "horizontal";

  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white overflow-hidden">
      
      {/* Aviso Urgente Opcional */}
      {section.config?.alert && (
         <div className="mb-8 w-full py-3 flex items-center gap-3 font-bold text-xs bg-white" style={{ color: "#0d5c63" }}>
            <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5]" style={{ color: "#0d5c63" }} />
            <span>{section.config.alert}</span>
         </div>
      )}

      {section.title && (
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between pb-4 gap-4">
          <div>
            {section.subtitle && <span className="text-[10px] font-black tracking-[0.3em] block mb-2" style={{ color: "#4a7c80" }}>// {section.subtitle}</span>}
            <h2 className="text-3xl font-black tracking-tighter italic" style={{ color: "#0d5c63" }}>{section.title}</h2>
          </div>
        </div>
      )}

      <div className={`flex ${isHorizontal ? 'flex-col md:flex-row overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory' : 'grid grid-cols-1 md:grid-cols-3'} gap-6`}>
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl relative group ${isHorizontal ? 'snap-center shrink-0 w-full md:w-[calc(33.333%-16px)] min-w-[290px]' : ''}`}
            style={{ background: "#ffffff", border: "2px solid #b2dede", borderRadius: "24px" }}
          >
            <div>
              <h3 className="text-xl font-black tracking-tight mb-3 italic uppercase min-h-[56px] flex items-center" style={{ color: "#083d42" }}>
                {item.title}
              </h3>
              <p className="normal-case font-medium text-xs leading-relaxed mb-6 max-w-xl" style={{ color: "#4a7c80" }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// 4. TIMELINE (Línea de proceso)
function TimelineSection({ section }: { section: CustomSection }) {
  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white">
      <div className="mb-12 pb-4">
        <span className="text-[10px] font-black tracking-[0.3em]" style={{ color: "#4a7c80" }}>// {section.subtitle || "PASO A PASO"}</span>
        <h2 className="text-3xl font-black tracking-tighter italic" style={{ color: "#0d5c63" }}>{section.title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {section.items.map((item, i) => {
          // Si no viene en el config, calculamos el número ej: "01"
          const stepNumber = item.config?.stepNumber || `0${i + 1}`.slice(-2);
          
          return (
            <div 
              key={item.id} 
              className="p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all"
              style={{ background: "#ffffff", border: "2px solid #b2dede", borderRadius: "24px" }}
            >
              <div>
                <span className="text-4xl font-black italic tracking-tighter block mb-4" style={{ color: "#b2dede" }}>// {stepNumber}</span>
                <h4 className="font-black text-sm tracking-tight mb-2 uppercase" style={{ color: "#083d42" }}>{item.title}</h4>
                <p className="normal-case tracking-normal text-xs font-medium leading-normal" style={{ color: "#4a7c80" }}>{item.description}</p>
              </div>
              <div className="flex justify-end mt-6">
                <CheckCircle2 className="w-4 h-4" style={{ color: "#0d5c63" }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
}

// 5. PREGUNTAS FRECUENTES
function FaqSection({ section }: { section: CustomSection }) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white border-t" style={{ borderColor: "#b2dede" }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <span className="text-[10px] font-black tracking-[0.3em]" style={{ color: "#0d5c63" }}>// DESPEJÁ TUS DUDAS</span>
          <h2 className="text-3xl font-black tracking-tighter italic mb-4" style={{ color: "#083d42" }}>{section.title || "PREGUNTAS FRECUENTES"}</h2>
          {section.subtitle && (
            <p className="normal-case text-xs font-medium tracking-normal leading-relaxed" style={{ color: "#4a7c80" }}>
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="lg:col-span-8 space-y-3">
          {section.items.map((faq) => (
            <div 
              key={faq.id} 
              className="border transition-all shadow-sm"
              style={{ background: "#ffffff", borderColor: "#b2dede", borderRadius: "16px" }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full p-5 flex items-center justify-between text-left font-black text-xs tracking-wide transition-colors"
                style={{ color: "#083d42" }}
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 shrink-0" style={{ color: "#4a7c80" }} />
                  {faq.title}
                </span>
                <ChevronDown 
                  className="w-4 h-4 transition-transform duration-300" 
                  style={{ 
                    color: openFaq === faq.id ? "#0d5c63" : "#4a7c80",
                    transform: openFaq === faq.id ? "rotate(180deg)" : "none" 
                  }} 
                />
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: openFaq === faq.id ? "auto" : 0 }}
                className="overflow-hidden"
              >
                <div 
                  className="p-5 pt-0 border-t normal-case font-medium text-xs tracking-normal leading-relaxed"
                  style={{ color: "#4a7c80", borderColor: "#f0fafa" }}
                >
                  {faq.description}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 6. CTA DE ADHESIÓN / CONTACTO
function CtaSection({ section }: { section: CustomSection }) {
  const { pageConfig} = usePageConfig();
  const config = pageConfig || {};
  const btnText = section.config?.buttonText || "ESCRIBINOS";
  const btnLink = section.config?.buttonLink || "#";

  // Si es estilo "bloque" (Como en la página de Arreglos)
  if (section.config?.style === "block") {
    return (
      <section className="w-full bg-white grid grid-cols-1 lg:grid-cols-12 gap-0 border-t-2" style={{ borderColor: "#b2dede" }}>
        <div className="lg:col-span-7 bg-white p-8 md:p-14 flex flex-col justify-between gap-8">
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3" style={{ color: "#0d5c63" }}>
              // {section.subtitle}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-[0.9] uppercase" style={{ color: "#083d42" }}>
              {section.title}
            </h2>
            <p className="normal-case font-medium text-xs md:text-sm tracking-normal mt-4 max-w-md" style={{ color: "#4a7c80" }}>
              {section.config?.description}
            </p>
          </div>
          <div>
            <a 
              href={btnLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl"
              style={{ background: "#0d5c63", borderRadius: "14px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#083d42")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0d5c63")}
            >
              {btnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 p-8 md:p-14 flex items-center justify-center" style={{ background: "#f0fafa" }}>
          {/* Acá puedes integrar tu LocationCard real si lo configuras en la BD */}
          <section 
                    className="flex items-center justify-center border-t-2" 
                    style={{ 
                      backgroundColor: pageConfig.secondaryColor || "#f8fafc",
                      borderColor: `${pageConfig.primaryColor}20`|| "#b2dede"  
                    }}
                  >
                    <LocationCard
                      title="Nuestra Sucursal Central"
                      days="Lunes a Sábados"
                      hours="09:00 hs a 20:00 hs"
                      config={config}
                    />
                  </section>
        </div>
      </section>
    );
  }

  // Estilo "Banner" (Como en el Plan de Ahorro)
  return (
    <section 
      className="w-full px-4 md:px-12 lg:px-16 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-2" 
      style={{ background: "#f0fafa", borderColor: "#b2dede" }}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none mb-1" style={{ color: "#083d42" }}>{section.title}</h2>
        <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#0d5c63" }}>{section.subtitle}</p>
      </div>
      
      <a 
        href={btnLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl"
        style={{ background: "#0d5c63", borderRadius: "14px" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#083d42")}
        onMouseLeave={e => (e.currentTarget.style.background = "#0d5c63")}
      >
        {btnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
      </a>
    </section>
  );
}