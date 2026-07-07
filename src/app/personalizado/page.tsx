"use client";

import { useState, useEffect } from "react";
import { createCustomBoard } from "@/actions/custom-boards";
import { getBoardOptions } from "@/actions/board-options";
import { toast } from "sonner";
import { Loader2, Settings2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

// --- NUEVA PALETA BASADA EN CIAN ---
const T = {
  surface: "#ffffff",
  cyanDk: "#0891b2", // Cian oscuro para textos destacados y badges
  cyanMd: "#06b6d4", // Cian principal de la marca
  accent: "rgba(6,182,212,0.06)", // Fondo muy sutil para selecciones activas
} as const;

type BoardType = {
  id: string; name: string; svgPath: string | null; active: boolean;
  allowedTails: { id: string; name: string; svgPath: string | null }[];
  allowedFins: { id: string; name: string }[];
  allowedConfigs: { id: string; name: string; count: number }[];
};
type BoardMaterial = { id: string; name: string; description: string | null };
type BoardDelivery = { id: string; label: string; description: string | null };
type BoardOptions = { types: BoardType[]; materials: BoardMaterial[]; deliveryOptions: BoardDelivery[]; whatsapp: string | null };

type State = {
  tipo: string; largo: string; ancho: string; espesor: string;
  volumen: string; material: string; cola: string;
  killaTipo: string; killaCount: string; notas: string;
  deliveryOption: string;
};

const FIN_POSITIONS: Record<number, [number, number][]> = {
  1: [[30, 138]], 2: [[22, 140], [38, 140]], 3: [[22, 138], [30, 136], [38, 138]],
  4: [[20, 134], [27, 138], [33, 138], [40, 134]], 5: [[20, 132], [26, 136], [30, 134], [34, 136], [40, 132]],
};
const DEFAULT_BOARD = "M30,4 C42,4 52,30 52,80 C52,120 44,148 30,156 C16,148 8,120 8,80 C8,30 18,4 30,4 Z";
const DEFAULT_TAIL = "M16,148 Q30,156 44,148";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "white", flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.122 1.526 5.858L0 24l6.337-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.65-.487-5.18-1.34l-.37-.22-3.762.894.948-3.657-.244-.38A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span style={{
      width: 24, height: 24, borderRadius: "50%", background: T.cyanMd, color: "#ffffff",
      fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>{n}</span>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", transition: "all 0.12s",
      fontWeight: active ? 700 : 400,
      border: active ? `1.5px solid ${T.cyanMd}` : "0.5px solid #d1d5db",
      background: active ? T.accent : T.surface,
      color: active ? T.cyanDk : "#6b7280",
    }}>{label}</button>
  );
}

function SpecRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const empty = !value;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: "0.5px solid #f0f0f0", fontSize: 13 }}>
      <span style={{ color: "#9ca3af" }}>{label}</span>
      <span style={{ fontWeight: empty ? 400 : 500, color: empty ? "#d1d5db" : "#1a2e2e", fontStyle: empty ? "italic" : "normal" }}>
        {empty ? "—" : value + (unit ?? "")}
      </span>
    </div>
  );
}

function BoardPreview({ state, options }: { state: State; options: BoardOptions }) {
  const selectedType = options.types.find(t => t.name === state.tipo);
  const boardPath = selectedType?.svgPath || DEFAULT_BOARD;
  let tailPath = DEFAULT_TAIL;
  if (state.cola && selectedType) {
    const tailObj = selectedType.allowedTails.find(t => t.name === state.cola);
    if (tailObj?.svgPath) tailPath = tailObj.svgPath;
  }
  const configObj = selectedType?.allowedConfigs.find(c => c.name === state.killaCount);
  const fins = FIN_POSITIONS[configObj?.count ?? 0] ?? [];
  return (
    <svg width="60" height="160" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d={boardPath} fill={T.cyanMd} opacity={0.9} />
      <path d={tailPath} fill="none" stroke="white" strokeWidth={1.5} opacity={0.6} />
      {fins.map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx={3} ry={6} fill="white" opacity={0.75} />)}
    </svg>
  );
}

const card: React.CSSProperties = {
  background: T.surface, borderRadius: 24, border: `2px solid ${T.border}`, padding: "1.5rem", marginBottom: "1rem",
};
const inputSt: React.CSSProperties = {
  border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 14,
  outline: "none", background: "#fff", color: "#083d42", width: "100%",
};

export default function PersonalizadoPage() {
  const { pageConfig } = usePageConfig();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [options, setOptions] = useState<BoardOptions | null>(null);
  
  useEffect(() => {
    if (pageConfig?.pageConfig && Boolean(pageConfig.pageConfig.personalizadoEnabled) === false) {
      router.replace("/");
    }
  }, [pageConfig, router]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [s, setS] = useState<State>({ tipo: "", largo: "", ancho: "", espesor: "", volumen: "", material: "", cola: "", killaTipo: "", killaCount: "", notas: "", deliveryOption: "" });


  const toggle = (key: keyof State) => (val: string) =>
    setS(prev => {
      const next = { ...prev, [key]: prev[key] === val ? "" : val };
      if (key === "tipo" && options) {
        const sel = options.types.find(t => t.name === next.tipo);
        if (sel) {
          if (!sel.allowedTails.some(t => t.name === next.cola)) next.cola = "";
          if (!sel.allowedFins.some(f => f.name === next.killaTipo)) next.killaTipo = "";
          if (!sel.allowedConfigs.some(c => c.name === next.killaCount)) next.killaCount = "";
        }
      }
      return next;
    });

  const onInput = (key: keyof State) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS(prev => ({ ...prev, [key]: e.target.value }));

  const complete = !!(s.tipo && s.largo && s.ancho && s.espesor && s.material && s.cola && s.killaTipo && s.killaCount && s.deliveryOption);

  function buildMsg() {
    const vol = s.volumen ? `\n• Volumen: ${s.volumen} L` : "";
    const notas = s.notas.trim() ? `\n• Notas: ${s.notas}` : "";
    return `Hola! Quiero encargar una tabla personalizada 🏄\n\n*NewSurfBoard — Pedido*\n• Tipo: ${s.tipo}\n• Largo: ${s.largo} pies\n• Ancho: ${s.ancho}"\n• Espesor: ${s.espesor}"${vol}\n• Material: ${s.material}\n• Cola: ${s.cola}\n• Sistema: ${s.killaTipo}\n• Killas: ${s.killaCount}\n• Entrega estimada: ${s.deliveryOption}\n Notas:${s.notas}\n\nQuedo a la espera de más info. Gracias!`;
  }

  async function handleSend() {
    const waNumber = options?.whatsapp;
    if (!waNumber) {
      toast.error("No hay número de WhatsApp configurado. Contactá al administrador.");
      return;
    }
    setIsSubmitting(true);
    const res = await createCustomBoard({ ...s, deliveryOption: s.deliveryOption });
    setIsSubmitting(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Pedido registrado correctamente.");
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(buildMsg())}`, "_blank", "noopener,noreferrer");
  }

  if (!options) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Loader2 className="animate-spin" size={48} color={T.cyanMd} />
      </main>
    );
  }

  const sel = s.tipo ? options.types.find(t => t.name === s.tipo) : null;
  const validTails = sel?.allowedTails.map(t => t.name) ?? [];
  const validFins = sel?.allowedFins.map(f => f.name) ?? [];
  const validConfigs = sel?.allowedConfigs.map(c => c.name) ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: 110, paddingBottom: 60, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <div style={{ marginBottom: 28, position: "relative" }}>
          {isAdmin && (
            <Link href="/admin/personalizado" style={{ position: "absolute", top: 0, right: 0, display: "flex", alignItems: "center", gap: 6, background: T.cyanDk, color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              <Settings2 size={14} /> Configurar
            </Link>
          )}
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: T.cyanMd, marginBottom: 4 }}>NewSurfBoard</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", fontStyle: "italic", color: "#0f172a", margin: "0 0 4px" }}>Diseñá tu tabla</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Personalizá cada detalle y te mandamos el pedido por WhatsApp.</p>
        </div>

        {/* Tipo */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={1} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Tipo de tabla</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {options.types.map(t => <Chip key={t.name} label={t.name} active={s.tipo === t.name} onClick={() => toggle("tipo")(t.name)} />)}
          </div>
        </div>

        {s.tipo && (
          <div>
            {/* Medidas */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={2} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Medidas</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {([
                  { key: "largo" as const, label: "Largo", unit: "pies", ph: "6.2", min: 4, max: 12, step: 0.1 },
                  { key: "ancho" as const, label: "Ancho", unit: "pulgadas", ph: "20.5", min: 14, max: 26, step: 0.25 },
                  { key: "espesor" as const, label: "Espesor", unit: "pulgadas", ph: "2.5", min: 1, max: 4, step: 0.25 },
                  { key: "volumen" as const, label: "Volumen (opcional)", unit: "litros", ph: "32", min: 20, max: 100, step: 0.5 },
                ]).map(({ key, label, unit, ph, min, max, step }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" value={s[key]} onChange={onInput(key)} placeholder={ph} min={min} max={max} step={step} style={{ ...inputSt, flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={3} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Material de laminado</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {options.materials.map(({ name, description }) => (
                  <Chip key={name} label={`${name}${description ? ` — ${description}` : ''}`} active={s.material === name} onClick={() => toggle("material")(name)} />
                ))}
              </div>
            </div>

            {/* Cola */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={4} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Tipo de cola</span></div>
              {validTails.length > 0
                ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{validTails.map(name => <Chip key={name} label={name} active={s.cola === name} onClick={() => toggle("cola")(name)} />)}</div>
                : <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Este modelo no tiene opciones de cola especificadas.</p>}
            </div>

            {/* Killas */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={5} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Sistema de anclaje</span></div>
              {validFins.length > 0
                ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>{validFins.map(name => <Chip key={name} label={name} active={s.killaTipo === name} onClick={() => toggle("killaTipo")(name)} />)}</div>
                : <p style={{ fontSize: 13, color: "#64748b", margin: 0, marginBottom: 20 }}>Sin sistemas especificados.</p>}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={6} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Configuración de killas</span></div>
              {validConfigs.length > 0
                ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{validConfigs.map(name => <Chip key={name} label={name} active={s.killaCount === name} onClick={() => toggle("killaCount")(name)} />)}</div>
                : <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Sin configuraciones especificadas.</p>}
            </div>

            {/* Notas */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={7} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Detalles adicionales</span></div>
              <textarea value={s.notas} onChange={onInput("notas")} rows={3} placeholder="Color, diseño de deck, grip, observaciones..." style={{ ...inputSt, resize: "vertical", lineHeight: 1.6, padding: "10px 12px" }} />
            </div>

            {/* Fecha de entrega */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><StepBadge n={8} /><span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", color: "#0f172a" }}>Fecha de entrega</span></div>
              {options.deliveryOptions.length > 0
                ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {options.deliveryOptions.map(({ label, description }) => (
                    <Chip
                      key={label}
                      label={description ? `${label} — ${description}` : label}
                      active={s.deliveryOption === label}
                      onClick={() => toggle("deliveryOption")(label)}
                    />
                  ))}
                </div>
                : <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>No hay fechas de entrega configuradas.</p>
              }
            </div>

            {/* Preview */}
            <div style={{ ...card, border: `1px solid ${T.cyanMd}33` }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: T.cyanMd, marginBottom: 16 }}>// Resumen de tu tabla</p>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <BoardPreview state={s} options={options} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SpecRow label="Tipo" value={s.tipo} />
                  <SpecRow label="Largo" value={s.largo} unit={s.largo ? " pies" : ""} />
                  <SpecRow label="Ancho" value={s.ancho} unit={s.ancho ? '"' : ""} />
                  <SpecRow label="Espesor" value={s.espesor} unit={s.espesor ? '"' : ""} />
                  <SpecRow label="Volumen" value={s.volumen} unit={s.volumen ? " L" : ""} />
                  <SpecRow label="Material" value={s.material} />
                  <SpecRow label="Cola" value={s.cola} />
                  <SpecRow label="Sistema" value={s.killaTipo} />
                  <SpecRow label="Killas" value={s.killaCount} />
                  <SpecRow label="Entrega" value={s.deliveryOption} />
                  {s.notas.trim() && <SpecRow label="Notas" value={s.notas.length > 60 ? s.notas.slice(0, 60) + "…" : s.notas} />}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button onClick={complete ? handleSend : undefined} disabled={!complete || isSubmitting} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 900,
              textTransform: "uppercase", letterSpacing: 1,
              cursor: (complete && !isSubmitting) ? "pointer" : "not-allowed",
              background: complete ? T.cyanMd : "#e2e8f0",
              color: complete ? "#fff" : "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12, transition: "all 0.2s",
              boxShadow: complete ? "0 4px 14px rgba(6,182,212,0.3)" : "none"
            }}>
              {isSubmitting
                ? <><Loader2 className="animate-spin" /> Guardando pedido...</>
                : complete
                  ? <><WhatsAppIcon />Enviar pedido por WhatsApp</>
                  : "Completá tipo, medidas, material, cola, killas y entrega"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}