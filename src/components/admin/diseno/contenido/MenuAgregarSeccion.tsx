"use client";

import { useEffect, useRef, useState } from "react";
import {
  Grid2X2,
  LayoutDashboard,
  MapPin,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuAgregarSeccionProps {
  alCrearCarrusel: () => void;
  alAgregarDestacada: () => void;
  alAgregarUbicacion: () => void;
  ubicacionAgregada: boolean;
}

interface ItemMenu {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  deshabilitado: boolean;
  alClic: () => void;
}

export default function MenuAgregarSeccion({
  alCrearCarrusel,
  alAgregarDestacada,
  alAgregarUbicacion,
  ubicacionAgregada,
}: MenuAgregarSeccionProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alClicFuera = (evento: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    };
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  const items: ItemMenu[] = [
    {
      icono: LayoutDashboard,
      titulo: "Carrusel",
      descripcion: "Portada, banner o tarjetas",
      deshabilitado: false,
      alClic: () => {
        setAbierto(false);
        alCrearCarrusel();
      },
    },
    {
      icono: Grid2X2,
      titulo: "Sección destacada",
      descripcion: "Productos y categorías en cuadrícula",
      deshabilitado: false,
      alClic: () => {
        setAbierto(false);
        alAgregarDestacada();
      },
    },
    {
      icono: MapPin,
      titulo: "Ubicación",
      descripcion: ubicacionAgregada
        ? "Ya está en la página"
        : "Dirección y mapa de tu tienda",
      deshabilitado: ubicacionAgregada,
      alClic: () => {
        setAbierto(false);
        alAgregarUbicacion();
      },
    },
  ];

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90"
      >
        <Plus size={16} />
        Agregar sección
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-1.5 shadow-xl">
          {items.map((item) => (
            <button
              key={item.titulo}
              type="button"
              disabled={item.deshabilitado}
              onClick={item.alClic}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[var(--admin-fondo-hover)]",
                item.deshabilitado &&
                  "cursor-not-allowed opacity-50 hover:bg-transparent"
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-primario)]">
                <item.icono size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--admin-texto)]">
                  {item.titulo}
                </span>
                <span className="block text-xs text-[var(--admin-texto-suave)]">
                  {item.descripcion}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
