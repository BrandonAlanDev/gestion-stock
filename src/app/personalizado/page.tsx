"use client";

import { useState } from "react";

const WA_NUMBER = "5492235000000"; // ← Reemplazá con tu número real

/* ── Paleta del logo ────────────────────────────────────────────────── */
const T = {
  bg:      "#071a18",
  surface: "#ffffff",
  tealDk:  "#0d5c63",
  tealMd:  "#1a8a8a",
  tealLt:  "#4ab8b8",
  accent:  "rgba(13,92,99,0.10)",
  accentB: "#0d5c63",
  chip:    "#0d5c63",
  chipTxt: "#e8f5f5",
} as const;

// Lista ordenada real alineada con BOARD_SHAPES
const TIPOS = [
  "Shortboard", 
  "Huevos", 
  "Fish", 
  "Hybrid", 
  "Mid length", 
  "Mini Malibu", 
  "Funboard", 
  "Longboard", 
  "Gun"
];

const MATERIALES = [
  { val: "Epóxi", desc: "liviana y rígida" },
  { val: "Poliéster", desc: "clásica y flexible" },
];

// Lista alineada con TAIL_SHAPES
const COLAS = [
  "Pin tail", 
  "Round tail", 
  "RoudSquash tail", 
  "Squash tail", 
  "fullRoudSquash", 
  "Fish Tail (moderno)", 
  "Retro Fish Tail", 
  "Swallow tail", 
  "Square tail", 
  "Dimante tail", 
  "SquareFish", 
  "FullRoundSquashFish"
];

const KILLA_TIPOS = ["FCS II", "Futures", "FCS (clásico)", "Glasson (fijas)"];
const KILLA_COUNTS = ["1", "2", "3", "4", "5"];

type State = {
  tipo: string; largo: string; ancho: string; espesor: string;
  volumen: string; material: string; cola: string;
  killaTipo: string; killaCount: string; notas: string;
};

const BOARD_SHAPES: Record<string, string> = {
  Shortboard: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
  Huevos: "M30,8 C41,8 52,32 52,78 C52,118 44,146 30,154 C16,146 8,118 8,78 C8,32 19,8 30,8 Z",
  Fish: "M30,10 C41,10 52,32 52,78 C52,110 46,132 30,148 C14,132 8,110 8,78 C8,32 19,10 30,10 Z",
  Hybrid: "M30,8 C41,8 52,30 52,78 C52,116 45,142 30,152 C15,142 8,116 8,78 C8,30 19,8 30,8 Z",
  "Mid length": "M30,5 C39,5 49,32 49,82 C49,122 42,149 30,155 C18,149 11,122 11,82 C11,32 21,5 30,5 Z",
  "Mini Malibu": "M30,6 C40,6 50,32 50,80 C50,120 43,147 30,154 C17,147 10,120 10,80 C10,32 20,6 30,6 Z",
  Funboard: "M30,5 C39,5 50,30 50,80 C50,120 43,148 30,155 C17,148 10,120 10,80 C10,30 21,5 30,5 Z",
  Longboard: "M30,4 C38,4 48,35 48,85 C48,125 42,150 30,156 C18,150 12,125 12,85 C12,35 22,4 30,4 Z",
  Gun: "M30,3 C37,3 48,22 48,78 C48,122 41,150 30,157 C19,150 12,122 12,78 C12,22 23,3 30,3 Z",
};

const TAIL_SHAPES: Record<string, string> = {
  "Pin tail": "M22,146 Q30,156 38,146",
  "Round tail": "M16,148 Q30,158 44,148",
  "RoudSquash tail": "M16,148 Q30,156 44,148 L44,156 L16,156 Z",
  "Squash tail": "M16,150 L30,156 L44,150",
  "fullRoudSquash": "M16,148 Q30,156 44,148 L44,156 L16,156 Z",
  "Fish Tail (moderno)": "M22,146 Q30,156 38,146 L38,156 L22,156 Z",
  "Retro Fish Tail": "M22,146 Q30,156 38,146 L30,156 Z",
  "Swallow tail": "M14,148 L24,156 L30,150 L36,156 L46,148",
  "Square tail": "M16,150 L44,150 L44,156 L16,156 Z",
  "Dimante tail": "M16,148 L30,156 L44,148 L38,156 L30,150 L22,156 Z",
  "SquareFish": "M14,148 L46,148 L44,156 L30,152 L16,156 Z",
  "FullRoundSquashFish": "M14,148 Q30,154 46,148 L44,156 L30,151 L16,156 Z",
};

const FIN_POSITIONS: Record<number, [number, number][]> = {
  1: [[30,138]],
  2: [[22,140],[38,140]],
  3: [[22,138],[30,136],[38,138]],
  4: [[20,134],[27,138],[33,138],[40,134]],
  5: [[20,132],[26,136],[30,134],[34,136],[40,132]],
};

const DEFAULT_BOARD = "M30,4 C42,4 52,30 52,80 C52,120 44,148 30,156 C16,148 8,120 8,80 C8,30 18,4 30,4 Z";
const DEFAULT_TAIL  = "M16,148 Q30,156 44,148";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width:20,height:20,fill:"white",flexShrink:0 }} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.122 1.526 5.858L0 24l6.337-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.65-.487-5.18-1.34l-.37-.22-3.762.894.948-3.657-.244-.38A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span style={{
      width:24, height:24, borderRadius:"50%",
      background: T.tealDk, color:"#e8f5f5",
      fontSize:11, fontWeight:500,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>{n}</span>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 16px", borderRadius:8, fontSize:13, cursor:"pointer",
      transition:"all 0.12s", fontWeight: active ? 500 : 400,
      border: active ? `1.5px solid ${T.tealMd}` : "0.5px solid #d1d5db",
      background: active ? T.accent : T.surface,
      color: active ? T.tealDk : "#6b7280",
    }}>
      {label}
    </button>
  );
}

function SpecRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const empty = !value;
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"baseline",
      padding:"6px 0", borderBottom:"0.5px solid #f0f0f0", fontSize:13,
    }}>
      <span style={{ color:"#9ca3af" }}>{label}</span>
      <span style={{ fontWeight: empty ? 400 : 500, color: empty ? "#d1d5db" : "#1a2e2e", fontStyle: empty ? "italic" : "normal" }}>
        {empty ? "—" : value + (unit ?? "")}
      </span>
    </div>
  );
}

function BoardPreview({ state }: { state: State }) {
  const boardPath = BOARD_SHAPES[state.tipo] ?? DEFAULT_BOARD;
  const tailPath  = TAIL_SHAPES[state.cola]  ?? DEFAULT_TAIL;
  const fins      = FIN_POSITIONS[parseInt(state.killaCount)] ?? [];
  return (
    <svg width="60" height="160" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
      <path d={boardPath} fill={T.tealMd} opacity={0.9} />
      <path d={tailPath}  fill="none" stroke="white" strokeWidth={1.5} opacity={0.6} />
      {fins.map(([cx,cy],i) => <ellipse key={i} cx={cx} cy={cy} rx={3} ry={6} fill="white" opacity={0.75} />)}
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: T.surface,
  borderRadius: 16,
  border: "0.5px solid #e5e7eb",
  padding: "1.5rem",
  marginBottom: "1rem",
};

const inputStyle: React.CSSProperties = {
  border: "0.5px solid #d1d5db",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "#1a2e2e",
  width: "100%",
};

export default function BoardDesignerPage() {
  const [s, setS] = useState<State>({
    tipo:"", largo:"", ancho:"", espesor:"", volumen:"",
    material:"", cola:"", killaTipo:"", killaCount:"", notas:"",
  });

  const toggle = (key: keyof State) => (val: string) =>
    setS(prev => ({ ...prev, [key]: prev[key] === val ? "" : val }));

  const onInput = (key: keyof State) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS(prev => ({ ...prev, [key]: e.target.value }));

  const complete = !!(s.tipo && s.largo && s.ancho && s.espesor && s.material && s.cola && s.killaTipo && s.killaCount);

  function buildMsg() {
    const vol   = s.volumen ? `\n• Volumen: ${s.volumen} L` : "";
    const notas = s.notas.trim() ? `\n• Notas: ${s.notas}` : "";
    return (
      `Hola! Quiero encargar una tabla personalizada 🏄\n\n` +
      `*NewSurfBoard — Pedido*\n` +
      `• Tipo: ${s.tipo}\n• Largo: ${s.largo} pies\n• Ancho: ${s.ancho}"\n• Espesor: ${s.espesor}"${vol}\n` +
      `• Material: ${s.material}\n• Cola: ${s.cola}\n• Killas: ${s.killaCount} × ${s.killaTipo}${notas}\n\n` +
      `Quedo a la espera de más info. Gracias!`
    );
  }

  function handleSend() {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMsg())}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main style={{ minHeight:"100vh", background:"#f4f7f7", paddingTop:40, paddingBottom:60, paddingLeft:16, paddingRight:16 }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:3, textTransform:"uppercase", color:T.tealMd, marginBottom:4 }}>
            NewSurfBoard
          </p>
          <h1 style={{ fontSize:28, fontWeight:600, color:"#0d1f1f", margin:"0 0 4px" }}>Diseñá tu tabla</h1>
          <p style={{ fontSize:14, color:"#6b7280", margin:0 }}>Personalizá cada detalle y te mandamos el pedido por WhatsApp.</p>
        </div>

        {/* Step 1 — Tipo */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={1} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Tipo de tabla</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {TIPOS.map(t => <Chip key={t} label={t} active={s.tipo===t} onClick={() => toggle("tipo")(t)} />)}
          </div>
        </div>

        {/* Step 2 — Medidas */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={2} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Medidas</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {([
              { key:"largo"   as const, label:"Largo",            unit:"pies",    ph:"6.2",  min:4,  max:12,  step:0.1  },
              { key:"ancho"   as const, label:"Ancho",            unit:"pulgadas", ph:"20.5", min:14, max:26,  step:0.25 },
              { key:"espesor" as const, label:"Espesor",          unit:"pulgadas", ph:"2.5",  min:1,  max:4,   step:0.25 },
              { key:"volumen" as const, label:"Volumen (opcional)",unit:"litros",   ph:"32",   min:20, max:100, step:0.5  },
            ]).map(({ key, label, unit, ph, min, max, step }) => (
              <div key={key}>
                <label style={{ display:"block", fontSize:11, fontWeight:500, color:"#9ca3af", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{label}</label>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <input type="number" value={s[key]} onChange={onInput(key)} placeholder={ph} min={min} max={max} step={step} style={{ ...inputStyle, flex:1 }} />
                  <span style={{ fontSize:11, color:"#9ca3af", whiteSpace:"nowrap" }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 — Material */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={3} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Material de laminado</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {MATERIALES.map(({ val, desc }) => (
              <Chip key={val} label={`${val} — ${desc}`} active={s.material===val} onClick={() => toggle("material")(val)} />
            ))}
          </div>
        </div>

        {/* Step 4 — Cola */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={4} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Tipo de cola</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {COLAS.map(c => <Chip key={c} label={c} active={s.cola===c} onClick={() => toggle("cola")(c)} />)}
          </div>
        </div>

        {/* Step 5+6 — Killas */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={5} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Tipo de killas</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
            {KILLA_TIPOS.map(k => <Chip key={k} label={k} active={s.killaTipo===k} onClick={() => toggle("killaTipo")(k)} />)}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={6} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Cantidad de killas</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {KILLA_COUNTS.map(n => (
              <button key={n} onClick={() => toggle("killaCount")(n)} style={{
                width:40, height:40, borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500,
                border: s.killaCount===n ? `1.5px solid ${T.tealMd}` : "0.5px solid #d1d5db",
                background: s.killaCount===n ? T.accent : "#fff",
                color: s.killaCount===n ? T.tealDk : "#6b7280",
                transition:"all 0.12s",
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Step 7 — Notas */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <StepBadge n={7} />
            <span style={{ fontSize:14, fontWeight:500, color:"#1a2e2e" }}>Detalles adicionales</span>
          </div>
          <textarea
            value={s.notas} onChange={onInput("notas")} rows={3}
            placeholder="Color, diseño de deck, grip, observaciones..."
            style={{ ...inputStyle, resize:"vertical", lineHeight:1.6, padding:"10px 12px" }}
          />
        </div>

        {/* Preview */}
        <div style={{ ...cardStyle, border:`0.5px solid ${T.tealDk}44` }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:T.tealMd, marginBottom:16 }}>
            Resumen de tu tabla
          </p>
          <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
            <BoardPreview state={s} />
            <div style={{ flex:1, minWidth:0 }}>
              <SpecRow label="Tipo"     value={s.tipo} />
              <SpecRow label="Largo"    value={s.largo}   unit={s.largo   ? " pies" : ""} />
              <SpecRow label="Ancho"    value={s.ancho}   unit={s.ancho   ? '"'     : ""} />
              <SpecRow label="Espesor"  value={s.espesor} unit={s.espesor ? '"'     : ""} />
              <SpecRow label="Volumen"  value={s.volumen} unit={s.volumen ? " L"    : ""} />
              <SpecRow label="Material" value={s.material} />
              <SpecRow label="Cola"     value={s.cola} />
              <SpecRow label="Killas"   value={s.killaCount && s.killaTipo ? `${s.killaCount} × ${s.killaTipo}` : s.killaCount || s.killaTipo} />
              {s.notas.trim() && <SpecRow label="Notas" value={s.notas.length>60 ? s.notas.slice(0,60)+"…" : s.notas} />}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={complete ? handleSend : undefined}
          disabled={!complete}
          style={{
            width:"100%", padding:"16px", borderRadius:10, border:"none",
            fontSize:15, fontWeight:500, cursor: complete ? "pointer" : "not-allowed",
            background: complete ? "#25d366" : "#e5e7eb",
            color: complete ? "#fff" : "#9ca3af",
            display:"flex", alignItems:"center", justifyContent:"center", gap:12,
            transition:"background 0.15s",
          }}
        >
          {complete ? (
            <><WhatsAppIcon />Enviar pedido por WhatsApp</>
          ) : (
            "Completá tipo, medidas, material, cola y killas"
          )}
        </button>

      </div>
    </main>
  );
}