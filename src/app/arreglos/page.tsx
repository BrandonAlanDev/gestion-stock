"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import LocationCard from "@/components/ui/LocationCard";

export default function ArreglosPage() {
  // ==========================================
  // ESTADOS PARAMETRIZABLES (Modificables en tiempo real)
  // ==========================================

  // 1. Estado operativo del taller
  const [tallerConfig] = useState({
    demoraEstimada: "5 a 7 días hábiles",
    cuposDisponibles: 12,
    tallerSaturado: false, // Cambiar a true para mostrar alerta de demora
    noticiaUrgente: "Traé tu tabla limpia y sin parafinar para acelerar el diagnóstico técnico.",
  });

  // 2. Lista de servicios, precios y tiempos
  const [servicios] = useState([
    {
      id: "fijura-simple",
      title: "Fisuras / Golpes Simples",
      description: "Reparación de golpes menores en mampostería, cantos o deck que no afecten el alma de la tabla.",
    },
    {
      id: "caja-quillas",
      title: "Reemplazo de Caja de Quilla",
      description: "Extracción de caja dañada (FCS, FCS II, Futures) y reinstalación con refuerzo de resina de alta densidad.",
    },
    {
      id: "tabla-quebrada",
      title: "Reconstrucción / Tabla Quebrada",
      description: "Alineación del alma (stringer), unión estructural superior/inferior y laminado de refuerzo cosmético.",
    },
    {
      id: "unplug-leash",
      title: "Reposición de Plug de Leash",
      description: "Instalación completa de un nuevo plug de pita tras arrancamiento por tensión extrema.",
    }
  ]);

  // 3. Flujo de trabajo del taller
  const [pasosProceso] = useState([
    { step: "Paso 1", name: "Ingreso Técnico", desc: "Se remueve la parafina del área, se evalúa si el foam absorbió agua." },
    { step: "Paso 2", name: "Secado", desc: "Si hay humedad interna, la tabla se seca en condiciones controladas." },
    { step: "Paso 3", name: "Laminación & Resina", desc: "Se sella con resina respetando la composición original." },
    { step: "Paso 4", name: "Lijado Editorial", desc: "Acabado al agua progresivo para devolverle el comportamiento hidrodinámico." }
  ]);

  // Redirección a WhatsApp
  const handleWhatsAppClick = () => {
    const nroTelefono = "54223XXXXXXX";
    const mensaje = encodeURIComponent("¡Hola! Quería consultar por una reparación para mi tabla.");
    window.open(`https://wa.me/${nroTelefono}?text=${mensaje}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="w-full min-h-screen bg-white pt-24 uppercase tracking-wide selection:bg-cyan-50 selection:text-cyan-500">

      {/* 1. HERO DE DIAGNÓSTICO */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3 text-cyan-500">
              // TALLER TÉCNICO ESPECIALIZADO
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6 text-neutral-900">
              REPARACIONES
            </h1>
            <p className="normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal text-neutral-500">
              No te quedes afuera del agua. En nuestro taller reparamos desde fisuras menores hasta reconstrucciones complejas. Con materiales de primera y un proceso meticuloso.
            </p>
          </div>
        </div>
      </section>

      {/* BANNER DE AVISO URGENTE */}
      {tallerConfig.tallerSaturado && (
        <div className="w-full px-4 md:px-12 lg:px-16 py-3 flex items-center gap-3 font-bold text-xs bg-white text-cyan-500 border-b border-neutral-100">
          <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5] text-cyan-500" />
          <span>AVISO: CAPACIDAD AL LÍMITE. LOS TIEMPOS DE ESPERA PUEDEN SUFRIR DEMORAS ADICIONALES.</span>
        </div>
      )}

      {/* 2. TABLA DE TARIFAS Y LISTADO EN CARRUSEL HORIZONTAL */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white overflow-hidden">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between pb-4 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter italic text-neutral-800">
              MENÚ DE <span className="text-cyan-500">SOLUCIONES</span>
            </h2>
          </div>
        </div>

        {/* Contenedor del Carrusel Horizontal */}
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="p-6 md:p-8 flex flex-col justify-between transition-all duration-300 bg-white border border-neutral-200 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 relative group snap-center shrink-0 w-full md:w-[calc(33.333%-16px)] min-w-[290px]"
              style={{ borderRadius: "24px" }}
            >
              <div>
                <h3 className="text-xl font-black tracking-tight mb-3 italic uppercase min-h-[56px] flex items-center text-neutral-800">
                  {servicio.title}
                </h3>
                <p className="normal-case font-medium text-xs leading-relaxed mb-6 max-w-xl text-neutral-500">
                  {servicio.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FLUJO OPERATIVO DEL TALLER */}
      <section className="w-full px-4 md:px-12 lg:px-16 py-16 bg-white">
        <div className="mb-12">
          <span className="text-[10px] font-black tracking-[0.3em] text-neutral-400">// CONTROL DE CALIDAD INTERNO</span>
          <h2 className="text-3xl font-black tracking-tighter italic text-neutral-800">PROTOCOLO DE REPARACIÓN</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pasosProceso.map((p, i) => (
            <div
              key={i}
              className="p-6 flex flex-col justify-between bg-white border border-neutral-200 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 transition-all"
              style={{ borderRadius: "24px" }}
            >
              <div>
                <span className="text-4xl font-black italic tracking-tighter block mb-4 text-cyan-200">// {p.step}</span>
                <h4 className="font-black text-sm tracking-tight mb-2 uppercase text-neutral-800">{p.name}</h4>
                <p className="normal-case tracking-normal text-xs font-medium leading-normal text-neutral-500">{p.desc}</p>
              </div>
              <div className="flex justify-end mt-6">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECCIÓN UNIFICADA: CONTACTO Y UBICACIÓN (Limpia y sin bordes de división) */}
      <section className="w-full bg-white grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* Bloque Izquierdo: Comercial / Técnico */}
        <div className="lg:col-span-7 bg-white p-8 md:p-14 flex flex-col justify-between gap-8">
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3 text-cyan-500">
              // PRESUPUESTOS EN EL ACTO
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-[0.9] uppercase text-neutral-800">
              ¿TU TABLA <br /><span className="text-cyan-500">SE ROMPIÓ?</span>
            </h2>
            <p className="normal-case font-medium text-xs md:text-sm tracking-normal mt-4 max-w-md text-neutral-500">
              Ponete en contacto directo con nuestros técnicos. Traenos tu equipo al taller o envianos fotos de la rotura para una cotización estimativa inmediata.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full sm:w-auto text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl cursor-pointer"
              style={{ background: "#06b6d4", borderRadius: "14px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0891b2")}
              onMouseLeave={e => (e.currentTarget.style.background = "#06b6d4")}
            >
              ESCRIBINOS POR MÁS INFO
            </button>
          </div>
        </div>

        {/* Bloque Derecho: Ubicación */}
        <div className="lg:col-span-5 p-8 md:p-14 flex items-center justify-center bg-white">
          <div className="w-full max-w-sm">
            <div className="text-[9px] font-black mb-4 text-neutral-400">// COORDENADAS DE INGRESO</div>
            <LocationCard
              title="Nuestra Sucursal Central"
              address="Av. Montreal 1153"
              city="Santa Clara del Mar, Buenos Aires"
              days="Lunes a Sábados"
              hours="09:00 hs a 20:00 hs"
              phone="+54 223 XXX-XXXX"
              googleMapsUrl="https://maps.google.com/?q=Av.+Montreal+1153,+Santa+Clara+del+Mar"
            />
          </div>
        </div>

      </section>

    </main>
  );
}