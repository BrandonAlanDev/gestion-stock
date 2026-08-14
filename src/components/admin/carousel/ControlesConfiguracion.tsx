import { getContrastColor } from "@/lib/utils";
import HeroLayoutPicker from "./HeroLayoutPicker";
import type { DefinicionConfiguracion, TipoCarousel, VarianteCarousel } from "./registroConfiguraciones";

interface ControlesConfiguracionProps {
  tipo: TipoCarousel;
  variante: VarianteCarousel;
  definiciones: DefinicionConfiguracion[];
  ajustes: Record<string, unknown>;
  alCambiar: (clave: string, valor: unknown) => void;
  primaryColor: string;
  secondaryColor: string;
  ocultarSeleccionLayout?: boolean;
}

export default function ControlesConfiguracion({
  tipo,
  variante,
  definiciones,
  ajustes,
  alCambiar,
  primaryColor,
  secondaryColor,
  ocultarSeleccionLayout = false,
}: ControlesConfiguracionProps) {
  const textColor = getContrastColor(secondaryColor);

  const definicionesVisibles = definiciones.filter((d) => {
    if (d.control.control === "cardsLayout" && ocultarSeleccionLayout) {
      return false;
    }
    return d.visibleCuando ? d.visibleCuando(ajustes, tipo, variante) : true;
  });

  const grupos: { grupo: string; definiciones: DefinicionConfiguracion[] }[] = [];
  for (const d of definicionesVisibles) {
    const grupoExistente = grupos.find((g) => g.grupo === d.grupo);
    if (grupoExistente) {
      grupoExistente.definiciones.push(d);
    } else {
      grupos.push({ grupo: d.grupo, definiciones: [d] });
    }
  }

  const renderizarControl = (d: DefinicionConfiguracion) => {
    const control = d.control;
    if (control.control === "heroLayout") {
      return (
        <HeroLayoutPicker
          value={(ajustes.slideLayout as "standard" | "split" | "minimal") || "standard"}
          onChange={(v) => alCambiar("slideLayout", v)}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      );
    }
    if (control.control === "cardsLayout") {
      const layoutActual = (ajustes.layout as string) || "simple";
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>{d.etiqueta}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => alCambiar("layout", "simple")}
              className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
              style={{
                borderColor: layoutActual === "simple" ? primaryColor : textColor + "30",
                backgroundColor: layoutActual === "simple" ? primaryColor + "15" : "transparent",
              }}
            >
              <span className="font-bold block text-sm" style={{ color: textColor }}>Simple</span>
              <span className="text-xs block" style={{ color: textColor + "80" }}>Cuadrícula de tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => alCambiar("layout", "offers")}
              className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
              style={{
                borderColor: layoutActual === "offers" ? primaryColor : textColor + "30",
                backgroundColor: layoutActual === "offers" ? primaryColor + "15" : "transparent",
              }}
            >
              <span className="font-bold block text-sm" style={{ color: textColor }}>Ofertas</span>
              <span className="text-xs block" style={{ color: textColor + "80" }}>Carrusel de ofertas con descuento</span>
            </button>
          </div>
        </div>
      );
    }
    if (control.control === "slider") {
      const valor = typeof ajustes[d.clave] === "number" ? (ajustes[d.clave] as number) : (d.valorPorDefecto as number);
      return (
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
            {d.etiqueta}: {control.aMostrar(valor)}{control.unidad}
          </label>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={control.aMostrar(valor)}
            onChange={(e) => alCambiar(d.clave, control.aGuardar(Number(e.target.value)))}
            className="w-full h-2 rounded-lg appearance-none"
            style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
          />
        </div>
      );
    }
    if (control.control === "checkbox") {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(ajustes[d.clave] ?? d.valorPorDefecto) === true}
            onChange={(e) => alCambiar(d.clave, e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>{d.etiqueta}</span>
        </label>
      );
    }
    if (control.control === "select") {
      return (
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>{d.etiqueta}</label>
          <select
            value={(ajustes[d.clave] as string) ?? (d.valorPorDefecto as string)}
            onChange={(e) => alCambiar(d.clave, e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{ backgroundColor: textColor + "1A", border: "1px solid " + textColor + "30", color: textColor }}
          >
            {control.opciones.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor} style={{ backgroundColor: secondaryColor, color: textColor }}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => {
        const checkboxes = grupo.definiciones.filter((d) => d.control.control === "checkbox");
        const otros = grupo.definiciones.filter((d) => d.control.control !== "checkbox");
        return (
          <div key={grupo.grupo} className="space-y-3">
            <h4 className="text-sm font-medium mb-3" style={{ color: textColor + "CC" }}>{grupo.grupo}</h4>
            {checkboxes.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {checkboxes.map((d) => (
                  <div key={d.clave}>{renderizarControl(d)}</div>
                ))}
              </div>
            )}
            {otros.map((d) => (
              <div key={d.clave}>{renderizarControl(d)}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
