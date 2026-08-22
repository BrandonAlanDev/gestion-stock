"use client";

import { useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

const PATRON_HEX = /^#([0-9a-fA-F]{6})$/;

interface ColorPickerProps {
  valor: string;
  alCambiar: (valor: string) => void;
  etiqueta?: string;
  presets?: string[];
}

export default function ColorPicker({
  valor,
  alCambiar,
  etiqueta,
  presets,
}: ColorPickerProps) {
  const idNativo = useId();
  const [texto, setTexto] = useState(valor);

  useEffect(() => {
    setTexto(valor);
  }, [valor]);

  const manejarTexto = (nuevoTexto: string) => {
    setTexto(nuevoTexto);
    const normalizado = nuevoTexto.startsWith("#") ? nuevoTexto : `#${nuevoTexto}`;
    if (PATRON_HEX.test(normalizado)) {
      alCambiar(normalizado);
    }
  };

  const confirmarTexto = () => {
    if (!PATRON_HEX.test(texto)) {
      setTexto(valor);
    }
  };

  return (
    <div>
      {etiqueta && (
        <label
          htmlFor={idNativo}
          className="mb-2 block text-sm font-medium text-[var(--admin-texto)]"
        >
          {etiqueta}
        </label>
      )}
      <div className="flex items-center gap-2">
        <label
          htmlFor={idNativo}
          className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-lg border border-[var(--admin-borde)]"
          style={{ backgroundColor: valor }}
        >
          <input
            id={idNativo}
            type="color"
            value={valor}
            onChange={(evento) => alCambiar(evento.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Seleccionar color"
          />
        </label>
        <input
          type="text"
          value={texto}
          onChange={(evento) => manejarTexto(evento.target.value)}
          onBlur={confirmarTexto}
          className="h-9 w-28 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 text-sm font-mono uppercase text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none"
        />
        {presets !== undefined && (
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => alCambiar(preset)}
                className={cn(
                  "h-7 w-7 cursor-pointer rounded-md border border-[var(--admin-borde)]",
                  preset.toLowerCase() === valor.toLowerCase() &&
                    "ring-2 ring-[var(--admin-primario)]",
                )}
                style={{ backgroundColor: preset }}
                aria-label={`Color ${preset}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
