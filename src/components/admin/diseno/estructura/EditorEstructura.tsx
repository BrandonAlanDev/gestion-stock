"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Grid2X2,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  MapPin,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { getAllCarousels } from "@/actions/carousel/carousel.actions";
import { updateSectionOrder } from "@/actions/page-config/order.actions";
import FilaSeccion from "@/components/admin/diseno/contenido/FilaSeccion";
import { normalizarSecciones } from "@/components/admin/diseno/contenido/normalizarSecciones";
import type { ConfigContenido } from "@/components/admin/diseno/contenido/tipos-contenido";
import type { Carousel } from "@/types/carousel";

import SeccionPaginaDinamica from "./SeccionPaginaDinamica";
import type { PaginaDinamicaEstructura } from "./tipos-estructura";

const PREFIJO_CARRUSEL = "carousel_";

const ETIQUETAS_TIPO: Record<Carousel["type"], string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

const ICONOS_TIPO: Record<Carousel["type"], LucideIcon> = {
  HERO: LayoutDashboard,
  BANNER: Megaphone,
  CARDS: ImageIcon,
};

export default function EditorEstructura({
  config,
  paginas,
}: {
  config: ConfigContenido;
  paginas: PaginaDinamicaEstructura[];
}) {
  const router = useRouter();
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [filas, setFilas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paginaSeleccionada, setPaginaSeleccionada] = useState("inicio");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const carouselPorId = useMemo(
    () => new Map(carousels.map((c) => [c.id, c])),
    [carousels]
  );

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const res = await getAllCarousels();
        if (!activo) return;
        if (res.success && res.data) {
          const datos = res.data as Carousel[];
          setCarousels(datos);
          setFilas(normalizarSecciones(datos, config.sectionOrder));
        } else {
          toast.error(res.error);
        }
      } catch {
        toast.error("Error al cargar secciones");
      } finally {
        if (activo) setCargando(false);
      }
    };
    void cargar();
    return () => {
      activo = false;
    };
  }, [config.sectionOrder]);

  const handleDragEnd = async (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;

    const indiceViejo = filas.indexOf(active.id as string);
    const indiceNuevo = filas.indexOf(over.id as string);
    if (indiceViejo < 0 || indiceNuevo < 0) return;

    const nuevoOrden = arrayMove(filas, indiceViejo, indiceNuevo);
    setFilas(nuevoOrden);

    const res = await updateSectionOrder(nuevoOrden);
    if (res.success) {
      toast.success("Orden actualizado");
    } else {
      toast.error(res.error || "Error al guardar el orden");
      setFilas(filas);
    }
  };

  const resolverFila = (id: string) => {
    if (id === "featured") {
      const cantidad = config.homegrid?.grids.length ?? 0;
      return (
        <FilaSeccion
          key={id}
          id={id}
          icono={Grid2X2}
          titulo="Sección destacada"
          detalle={cantidad ? `${cantidad} tarjetas` : "Sin configurar"}
          varianteBadge={cantidad ? "activo" : "sin-configurar"}
          textoBadge={cantidad ? "Visible" : "Sin configurar"}
        />
      );
    }

    if (id === "location") {
      return (
        <FilaSeccion
          key={id}
          id={id}
          icono={MapPin}
          titulo="Ubicación"
          detalle={config.address ?? "Sin dirección"}
          varianteBadge={config.locationEnabled ? "activo" : "sin-configurar"}
          textoBadge={config.locationEnabled ? "Visible" : "Sin dirección"}
        />
      );
    }

    if (id.startsWith(PREFIJO_CARRUSEL)) {
      const carousel = carouselPorId.get(id.slice(PREFIJO_CARRUSEL.length));
      if (!carousel) return null;
      const cantidad = carousel.slides?.length ?? 0;
      const etiqueta = ETIQUETAS_TIPO[carousel.type];
      return (
        <FilaSeccion
          key={id}
          id={id}
          icono={ICONOS_TIPO[carousel.type]}
          titulo={carousel.title || etiqueta}
          detalle={`${etiqueta} · ${cantidad} slides`}
          varianteBadge={carousel.active ? "activo" : "oculto"}
          textoBadge={carousel.active ? "Visible" : "Oculto"}
          alEditar={() => router.push("/admin/design/contenido")}
        />
      );
    }

    return null;
  };

  const paginaActual = paginas.find((p) => p.slug === paginaSeleccionada);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold text-[var(--admin-texto)]">Estructura</h3>
        <select
          value={paginaSeleccionada}
          onChange={(e) => setPaginaSeleccionada(e.target.value)}
          className="min-w-0 max-w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none"
        >
          <option value="inicio" style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>Inicio</option>
          {paginas.map((p) => (
            <option key={p.id} value={p.slug} style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {paginaSeleccionada === "inicio" ? (
        <>
          <p className="text-sm text-[var(--admin-texto-suave)]">
            Arrastrá las secciones para definir el orden en que aparecen en tu
            página de inicio.
          </p>
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-texto-suave)]" />
            </div>
          ) : filas.length === 0 ? (
            <p className="text-sm text-[var(--admin-texto-suave)]">
              No hay secciones en la página
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filas}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filas.map((id) => resolverFila(id))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      ) : paginaActual ? (
        <SeccionPaginaDinamica pagina={paginaActual} />
      ) : null}
    </div>
  );
}
