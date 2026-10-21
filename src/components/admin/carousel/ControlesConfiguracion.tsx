import HeroLayoutPicker from "./HeroLayoutPicker";
import type { DefinicionConfiguracion, TipoCarousel, VarianteCarousel } from "./registroConfiguraciones";

interface ControlesConfiguracionProps {
  tipo: TipoCarousel;
  variante: VarianteCarousel;
  definiciones: DefinicionConfiguracion[];
  ajustes: Record<string, unknown>;
  alCambiar: (clave: string, valor: unknown) => void;
  ocultarSeleccionLayout?: boolean;
}

export default function ControlesConfiguracion({
  tipo,
  variante,
  definiciones,
  ajustes,
  alCambiar,
  ocultarSeleccionLayout = false,
}: ControlesConfiguracionProps) {
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
        />
      );
    }
    if (control.control === "cardsLayout") {
      const layoutActual = (ajustes.layout as string) || "simple";
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--admin-texto)]">{d.etiqueta}</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => alCambiar("layout", "simple")}
              className={`relative cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${layoutActual === "simple" ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10" : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"}`}
            >
              <span className="block text-sm font-bold text-[var(--admin-texto)]">Simple</span>
              <span className="block text-xs text-[var(--admin-texto-suave)]">Cuadrícula de tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => alCambiar("layout", "offers")}
              className={`relative cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${layoutActual === "offers" ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10" : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"}`}
            >
              <span className="block text-sm font-bold text-[var(--admin-texto)]">Ofertas</span>
              <span className="block text-xs text-[var(--admin-texto-suave)]">Carrusel de ofertas con descuento</span>
            </button>
          </div>
        </div>
      );
    }
    if (control.control === "slider") {
      const valor = typeof ajustes[d.clave] === "number" ? (ajustes[d.clave] as number) : (d.valorPorDefecto as number);
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--admin-texto)]">
            {d.etiqueta}: {control.aMostrar(valor)}{control.unidad}
          </label>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={control.aMostrar(valor)}
            onChange={(e) => alCambiar(d.clave, control.aGuardar(Number(e.target.value)))}
            className="w-full cursor-pointer accent-[var(--admin-primario)]"
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
            className="h-4 w-4 rounded accent-[var(--admin-primario)]"
          />
          <span className="text-sm text-[var(--admin-texto)]">{d.etiqueta}</span>
        </label>
      );
    }
    if (control.control === "select") {
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--admin-texto)]">{d.etiqueta}</label>
          <select
            value={(ajustes[d.clave] as string) ?? (d.valorPorDefecto as string)}
            onChange={(e) => alCambiar(d.clave, e.target.value)}
            className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2 text-sm text-[var(--admin-texto)] outline-none transition-all focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20"
          >
            {control.opciones.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
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
            <h4 className="mb-3 text-sm font-medium text-[var(--admin-texto)]">{grupo.grupo}</h4>
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
