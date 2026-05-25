"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";

const WA_NUMBER = ""; // ← reemplazá con tu número real

const TIPOS = ["Shortboard", "Longboard", "Fish", "Funboard", "Gun", "Mini Malibu", "Hybrid"];
const MATERIALES = [
  { val: "Epóxi", desc: "liviana y rígida" },
  { val: "Poliéster", desc: "clásica y flexible" },
];
const COLAS = ["Pin tail", "Round tail", "Squash tail", "Swallow tail", "Square tail", "Bat tail"];
const KILLA_TIPOS = ["FCS II", "Futures", "FCS (clásico)", "Glasson (fijas)"];
const KILLA_COUNTS = ["1", "2", "3", "4", "5"];

type State = {
  tipo: string;
  largo: string;
  ancho: string;
  espesor: string;
  volumen: string;
  material: string;
  cola: string;
  killaTipo: string;
  killaCount: string;
  notas: string;
};

const BOARD_SHAPES: Record<string, string> = {
  Shortboard: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
  Longboard: "M30,4 C38,4 48,35 48,85 C48,125 42,150 30,156 C18,150 12,125 12,85 C12,35 22,4 30,4 Z",
  Fish: "M30,10 C41,10 52,32 52,78 C52,110 46,132 30,148 C14,132 8,110 8,78 C8,32 19,10 30,10 Z",
  Funboard: "M30,5 C39,5 50,30 50,80 C50,120 43,148 30,155 C17,148 10,120 10,80 C10,30 21,5 30,5 Z",
  Gun: "M30,3 C37,3 48,22 48,78 C48,122 41,150 30,157 C19,150 12,122 12,78 C12,22 23,3 30,3 Z",
  "Mini Malibu": "M30,6 C40,6 50,32 50,80 C50,120 43,147 30,154 C17,147 10,120 10,80 C10,32 20,6 30,6 Z",
  Hybrid: "M30,8 C41,8 52,30 52,78 C52,116 45,142 30,152 C15,142 8,116 8,78 C8,30 19,8 30,8 Z",
};

const TAIL_SHAPES: Record<string, string> = {
  "Pin tail": "M22,146 Q30,156 38,146",
  "Round tail": "M16,148 Q30,158 44,148",
  "Squash tail": "M16,150 L30,156 L44,150",
  "Swallow tail": "M14,148 L24,156 L30,150 L36,156 L46,148",
  "Square tail": "M16,150 L44,150 L44,156 L16,156 Z",
  "Bat tail": "M14,146 L22,154 L30,149 L38,154 L46,146",
};

const FIN_POSITIONS: Record<number, [number, number][]> = {
  1: [[30, 138]],
  2: [[22, 140], [38, 140]],
  3: [[22, 138], [30, 136], [38, 138]],
  4: [[20, 134], [27, 138], [33, 138], [40, 134]],
  5: [[20, 132], [26, 136], [30, 134], [34, 136], [40, 132]],
};

const DEFAULT_BOARD = "M30,4 C42,4 52,30 52,80 C52,120 44,148 30,156 C16,148 8,120 8,80 C8,30 18,4 30,4 Z";
const DEFAULT_TAIL = "M16,148 Q30,156 44,148";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.122 1.526 5.858L0 24l6.337-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.65-.487-5.18-1.34l-.37-.22-3.762.894.948-3.657-.244-.38A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0" style={{ background: "#4fc3d4" }}>
      {n}
    </span>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
      style={{
        border: active ? "1.5px solid #4fc3d4" : "0.5px solid var(--color-border-secondary, #d1d5db)",
        background: active ? "rgba(79,195,212,0.10)" : "var(--color-background-primary, #fff)",
        color: active ? "#0d6e7a" : "var(--color-text-secondary, #6b7280)",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  );
}

function SpecRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const empty = !value;
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-gray-100 last:border-0 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={empty ? "text-gray-300 italic" : "font-medium text-gray-800"}>
        {empty ? "—" : value + (unit ?? "")}
      </span>
    </div>
  );
}

function BoardPreview({ state }: { state: State }) {
  const boardPath = BOARD_SHAPES[state.tipo] ?? DEFAULT_BOARD;
  const tailPath = TAIL_SHAPES[state.cola] ?? DEFAULT_TAIL;
  const fins = FIN_POSITIONS[parseInt(state.killaCount)] ?? [];

  return (
    <svg width="60" height="160" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d={boardPath} fill="#4fc3d4" opacity={0.85} />
      <path d={tailPath} fill="none" stroke="white" strokeWidth={1.5} opacity={0.6} />
      {fins.map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={3} ry={6} fill="white" opacity={0.7} />
      ))}
    </svg>
  );
}

export default function BoardDesignerPage() {
  const [s, setS] = useState<State>({
    tipo: "", largo: "", ancho: "", espesor: "", volumen: "",
    material: "", cola: "", killaTipo: "", killaCount: "", notas: "",
  });

  const set = (key: keyof State) => (val: string) =>
    setS(prev => ({ ...prev, [key]: prev[key] === val ? "" : val }));

  const setInput = (key: keyof State) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS(prev => ({ ...prev, [key]: e.target.value }));

  const isComplete =
    s.tipo && s.largo && s.ancho && s.espesor && s.material && s.cola && s.killaTipo && s.killaCount;

  function buildMessage() {
    const vol = s.volumen ? `\n• Volumen: ${s.volumen} L` : "";
    const notas = s.notas.trim() ? `\n• Notas: ${s.notas}` : "";
    return (
      `Hola! Quiero encargar una tabla personalizada 🏄\n\n` +
      `*NewSurfBoard — Pedido*\n` +
      `• Tipo: ${s.tipo}\n` +
      `• Largo: ${s.largo} pies\n` +
      `• Ancho: ${s.ancho}"\n` +
      `• Espesor: ${s.espesor}"${vol}\n` +
      `• Material: ${s.material}\n` +
      `• Cola: ${s.cola}\n` +
      `• Killas: ${s.killaCount} × ${s.killaTipo}${notas}\n\n` +
      `Quedo a la espera de más info. Gracias!`
    );
  }

  function handleSend() {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const inputCls =
    "w-full border rounded-lg px-3 py-2 text-sm bg-white text-gray-800 outline-none focus:ring-2 focus:border-[#4fc3d4]";
  const inputStyle = {
    border: "0.5px solid #d1d5db",
    borderRadius: "8px",
  } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-[#4fc3d4] uppercase mb-1">NewSurfBoard</p>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Diseñá tu tabla</h1>
          <p className="text-sm text-gray-400">Personalizá cada detalle y te mandamos el pedido por WhatsApp.</p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Step 1 — Tipo */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge n={1} />
              <span className="text-sm font-medium text-gray-700">Tipo de tabla</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(t => (
                <Chip key={t} label={t} active={s.tipo === t} onClick={() => set("tipo")(t)} />
              ))}
            </div>
          </section>

          {/* Step 2 — Medidas */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge n={2} />
              <span className="text-sm font-medium text-gray-700">Medidas</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "largo" as const, label: "Largo", unit: "pies", placeholder: "6.2", min: 4, max: 12, step: 0.1 },
                { key: "ancho" as const, label: "Ancho", unit: "pulgadas", placeholder: "20.5", min: 14, max: 26, step: 0.25 },
                { key: "espesor" as const, label: "Espesor", unit: "pulgadas", placeholder: "2.5", min: 1, max: 4, step: 0.25 },
                { key: "volumen" as const, label: "Volumen (opcional)", unit: "litros", placeholder: "32", min: 20, max: 100, step: 0.5 },
              ].map(({ key, label, unit, placeholder, min, max, step }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={s[key]}
                      onChange={setInput(key)}
                      placeholder={placeholder}
                      min={min}
                      max={max}
                      step={step}
                      className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#4fc3d4]/30 focus:border-[#4fc3d4]"
                      style={inputStyle}
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 3 — Material */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge n={3} />
              <span className="text-sm font-medium text-gray-700">Material de laminado</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MATERIALES.map(({ val, desc }) => (
                <Chip key={val} label={`${val} — ${desc}`} active={s.material === val} onClick={() => set("material")(val)} />
              ))}
            </div>
          </section>

          {/* Step 4 — Cola */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge n={4} />
              <span className="text-sm font-medium text-gray-700">Tipo de cola</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLAS.map(c => (
                <Chip key={c} label={c} active={s.cola === c} onClick={() => set("cola")(c)} />
              ))}
            </div>
          </section>

          {/* Step 5 — Killas tipo */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge n={5} />
              <span className="text-sm font-medium text-gray-700">Tipo de killas</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {KILLA_TIPOS.map(k => (
                <Chip key={k} label={k} active={s.killaTipo === k} onClick={() => set("killaTipo")(k)} />
              ))}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <StepBadge n={6} />
              <span className="text-sm font-medium text-gray-700">Cantidad de killas</span>
            </div>
            <div className="flex gap-2">
              {KILLA_COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => set("killaCount")(n)}
                  className="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                  style={{
                    border: s.killaCount === n ? "1.5px solid #4fc3d4" : "0.5px solid #d1d5db",
                    background: s.killaCount === n ? "rgba(79,195,212,0.10)" : "#fff",
                    color: s.killaCount === n ? "#0d6e7a" : "#6b7280",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* Step 7 — Notas */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge n={7} />
              <span className="text-sm font-medium text-gray-700">Detalles adicionales</span>
            </div>
            <textarea
              value={s.notas}
              onChange={setInput("notas")}
              rows={3}
              placeholder="Color, diseño de deck, grip, observaciones..."
              className="w-full text-sm px-3 py-2.5 rounded-lg outline-none resize-y leading-relaxed focus:ring-2 focus:ring-[#4fc3d4]/30 focus:border-[#4fc3d4]"
              style={inputStyle}
            />
          </section>

          {/* Preview */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">Resumen</p>
            <div className="flex gap-5 items-start">
              <BoardPreview state={s} />
              <div className="flex-1 min-w-0">
                <SpecRow label="Tipo" value={s.tipo} />
                <SpecRow label="Largo" value={s.largo} unit=" pies" />
                <SpecRow label="Ancho" value={s.ancho} unit={s.ancho ? '"' : ""} />
                <SpecRow label="Espesor" value={s.espesor} unit={s.espesor ? '"' : ""} />
                <SpecRow label="Volumen" value={s.volumen} unit={s.volumen ? " L" : ""} />
                <SpecRow label="Material" value={s.material} />
                <SpecRow label="Cola" value={s.cola} />
                <SpecRow
                  label="Killas"
                  value={s.killaCount && s.killaTipo ? `${s.killaCount} × ${s.killaTipo}` : s.killaCount || s.killaTipo}
                />
                {s.notas.trim() && (
                  <SpecRow label="Notas" value={s.notas.length > 60 ? s.notas.substring(0, 60) + "…" : s.notas} />
                )}
              </div>
            </div>
          </section>

          {/* CTA */}
          <button
            onClick={handleSend}
            disabled={!isComplete}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-medium text-base transition-all"
            style={{
              background: isComplete ? "#25d366" : "#e5e7eb",
              color: isComplete ? "#fff" : "#9ca3af",
              cursor: isComplete ? "pointer" : "not-allowed",
            }}
          >
            {isComplete ? (
              <>
                <WhatsAppIcon />
                Enviar pedido por WhatsApp
              </>
            ) : (
              "Completá tipo, medidas, material, cola y killas"
            )}
          </button>

        </div>
      </div>
    </main>
  );
}