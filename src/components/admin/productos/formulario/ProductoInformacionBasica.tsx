"use client";

import { useRef } from "react";
import { Bold, Italic, Underline, List, Link as LinkIcon } from "lucide-react";
import { CLASE_INPUT } from "@/lib/productos/estilos";

interface Props {
  name: string;
  description: string;
  onName: (valor: string) => void;
  onDescription: (valor: string) => void;
}

const BOTON_TOOLBAR =
  "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]";

export default function ProductoInformacionBasica({ name, description, onName, onDescription }: Props) {
  const refDescripcion = useRef<HTMLTextAreaElement>(null);

  const aplicarMarcado = (antes: string, despues: string, porLinea = false) => {
    const area = refDescripcion.current;
    if (!area) return;
    const inicio = area.selectionStart;
    const fin = area.selectionEnd;
    const seleccion = description.slice(inicio, fin) || "texto";

    if (porLinea) {
      const texto = description
        .split("\n")
        .map((linea) => linea.trim().startsWith(antes) ? linea : `${antes}${linea}`)
        .join("\n");
      onDescription(texto);
      return;
    }

    const texto = `${description.slice(0, inicio)}${antes}${seleccion}${despues}${description.slice(fin)}`;
    onDescription(texto);
    requestAnimationFrame(() => {
      area.focus();
      area.selectionStart = inicio + antes.length;
      area.selectionEnd = fin + antes.length;
    });
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Información básica</h3>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--admin-texto-suave)]">
          Nombre del producto *
        </label>
        <input
          className={CLASE_INPUT}
          placeholder="Ej. Zapatillas Urbanas"
          value={name}
          onChange={(e) => onName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Descripción</label>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-1">
            <button type="button" title="Negrita" className={BOTON_TOOLBAR} onClick={() => aplicarMarcado("**", "**")}>
              <Bold size={14} />
            </button>
            <button type="button" title="Cursiva" className={BOTON_TOOLBAR} onClick={() => aplicarMarcado("*", "*")}>
              <Italic size={14} />
            </button>
            <button type="button" title="Subrayado" className={BOTON_TOOLBAR} onClick={() => aplicarMarcado("<u>", "</u>")}>
              <Underline size={14} />
            </button>
            <button type="button" title="Lista" className={BOTON_TOOLBAR} onClick={() => aplicarMarcado("- ", "", true)}>
              <List size={14} />
            </button>
            <button type="button" title="Enlace" className={BOTON_TOOLBAR} onClick={() => aplicarMarcado("[", "](https://)")}>
              <LinkIcon size={14} />
            </button>
          </div>
          <textarea
            ref={refDescripcion}
            className={`${CLASE_INPUT} h-28 resize-none`}
            placeholder="Describí tu producto..."
            value={description}
            onChange={(e) => onDescription(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
