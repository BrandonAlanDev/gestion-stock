"use client";

import type { ReactNode } from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Eye,
  EyeOff,
  Grid2X2,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  MapPin,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

import CarouselDesignModal from "@/components/admin/carousel/CarouselDesignModal";
import CarouselSettingsModal from "@/components/admin/carousel/CarouselSettingsModal";
import CarouselWizard from "@/components/admin/carousel/CarouselWizard";
import ConfirmacionEliminarSeccion from "@/components/admin/carousel/ConfirmacionEliminarSeccion";
import Badge from "@/components/ui/badge";
import EstadoVacio from "@/components/ui/estado-vacio";
import type { Carousel } from "@/types/carousel";

import DrawerSeccionDestacada from "./DrawerSeccionDestacada";
import DrawerUbicacion from "./DrawerUbicacion";
import FilaSeccion from "./FilaSeccion";
import MenuAgregarSeccion from "./MenuAgregarSeccion";
import SeccionPaginasDinamicas from "./SeccionPaginasDinamicas";
import useGestorContenido from "./use-gestor-contenido";
import type { ConfigContenido, PaginaDinamicaResumen } from "./tipos-contenido";

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

export default function GestorContenido({
  config,
  paginasDinamicas,
}: {
  config: ConfigContenido;
  paginasDinamicas: PaginaDinamicaResumen[];
}) {
  const {
    abrirEdicionCarrusel,
    abrirWizardNuevo,
    actualizarCarouselLocal,
    cargando,
    carouselPorId,
    cerrarWizard,
    confirmarEliminacion,
    datosInicialesWizard,
    designCarousel,
    drawerDestacada,
    drawerUbicacion,
    duplicarCarrusel,
    eliminarId,
    filas,
    guardarWizard,
    handleDragEnd,
    paginaSeleccionada,
    sensors,
    setDesignCarousel,
    setDrawerDestacada,
    setDrawerUbicacion,
    setEliminarId,
    setPaginaSeleccionada,
    setSettingsCarousel,
    settingsCarousel,
    toggleSeccionFija,
    toggleVisibilidadCarrusel,
    wizardAbierto,
  } = useGestorContenido(config.sectionOrder);

  const ocultasFijas = ["featured", "location"].filter(
    (id) => !filas.includes(id)
  );
  const carruselesOcultos = [...carouselPorId.values()].filter(
    (c) => !c.active
  );
  const idsOcultos = new Set(
    carruselesOcultos.map((c) => PREFIJO_CARRUSEL + c.id)
  );
  const filasVisibles = filas.filter((id) => !idsOcultos.has(id));
  const hayOcultas = ocultasFijas.length > 0 || carruselesOcultos.length > 0;

  const estiloBotonAccion =
    "rounded-md p-1.5 text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]";

  const resolverFila = (id: string): ReactNode => {
    if (id === "featured") {
      const enOrden = filas.includes(id);
      const cantidad = config.homegrid?.grids.length ?? 0;
      return (
        <FilaSeccion
          key={id}
          id={id}
          icono={Grid2X2}
          titulo="Sección destacada"
          detalle={cantidad ? `${cantidad} tarjetas` : "Sin configurar"}
          varianteBadge={
            !enOrden ? "oculto" : cantidad ? "activo" : "sin-configurar"
          }
          textoBadge={
            !enOrden ? "Oculto" : cantidad ? "Visible" : "Sin configurar"
          }
          alEditar={() => setDrawerDestacada(true)}
          alVisibilidad={() => void toggleSeccionFija(id)}
          etiquetaVisibilidad={enOrden ? "Ocultar" : "Mostrar"}
        />
      );
    }

    if (id === "location") {
      const enOrden = filas.includes(id);
      return (
        <FilaSeccion
          key={id}
          id={id}
          icono={MapPin}
          titulo="Ubicación"
          detalle={config.address ?? "Sin dirección"}
          varianteBadge={
            !enOrden
              ? "oculto"
              : config.locationEnabled
                ? "activo"
                : "sin-configurar"
          }
          textoBadge={
            !enOrden
              ? "Oculto"
              : config.locationEnabled
                ? "Visible"
                : "Sin configurar"
          }
          alEditar={() => setDrawerUbicacion(true)}
          alVisibilidad={() => void toggleSeccionFija(id)}
          etiquetaVisibilidad={enOrden ? "Ocultar" : "Mostrar"}
        />
      );
    }

    if (id.startsWith(PREFIJO_CARRUSEL)) {
      const carousel = carouselPorId.get(id.slice(PREFIJO_CARRUSEL.length));
      if (!carousel) return null;
      const cantidad = carousel.slides?.length ?? 0;
      const label = ETIQUETAS_TIPO[carousel.type];
      return (
        <FilaSeccion
          key={id}
          id={id}
          icono={ICONOS_TIPO[carousel.type]}
          titulo={carousel.title || label}
          detalle={`${label} · ${cantidad} slides`}
          varianteBadge={
            carousel.active
              ? cantidad
                ? "activo"
                : "sin-configurar"
              : "oculto"
          }
          textoBadge={
            carousel.active ? (cantidad ? "Visible" : "Sin slides") : "Oculto"
          }
          alEditar={() => abrirEdicionCarrusel(carousel)}
          alDiseno={() => setDesignCarousel(carousel)}
          alAjustes={() => setSettingsCarousel(carousel)}
          alDuplicar={() => void duplicarCarrusel(carousel.id)}
          alVisibilidad={() => void toggleVisibilidadCarrusel(carousel)}
          etiquetaVisibilidad={carousel.active ? "Ocultar" : "Mostrar"}
          alEliminar={() => setEliminarId(carousel.id)}
        />
      );
    }

    return null;
  };

  const filaOculta = ({
    id,
    icono: Icono,
    titulo,
    detalle,
    alMostrar,
  }: {
    id: string;
    icono: LucideIcon;
    titulo: string;
    detalle: string;
    alMostrar: () => void;
  }): ReactNode => (
    <div key={id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)]">
        <Icono size={16} className="text-[var(--admin-texto)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
          {titulo}
        </p>
        <p className="truncate text-xs text-[var(--admin-texto-suave)]">
          {detalle}
        </p>
      </div>
      <Badge variante="oculto">Oculto</Badge>
      <button
        type="button"
        onClick={alMostrar}
        title="Mostrar"
        className={estiloBotonAccion}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[var(--admin-texto)]">Contenido</h3>
          <select
            value={paginaSeleccionada}
            onChange={(e) => setPaginaSeleccionada(e.target.value)}
            className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none"
          >
            <option value="inicio" style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>Inicio</option>
            {paginasDinamicas.map((p) => (
              <option key={p.id} value={p.slug} style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <MenuAgregarSeccion
          alCrearCarrusel={abrirWizardNuevo}
          alAgregarDestacada={() => void toggleSeccionFija("featured")}
          alAgregarUbicacion={() => void toggleSeccionFija("location")}
          destacadaAgregada={filas.includes("featured")}
          ubicacionAgregada={filas.includes("location")}
        />
      </div>

      {paginaSeleccionada === "inicio" ? (
        <>
          <p className="text-sm text-[var(--admin-texto-suave)]">
            Arrastrá para reordenar. Usá los iconos para editar, duplicar,
            mostrar u ocultar.
          </p>
          {cargando ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-texto-suave)]" />
            </div>
          ) : filasVisibles.length === 0 && !hayOcultas ? (
            <EstadoVacio
              icono={LayoutDashboard}
              titulo="Todavía no hay secciones"
              descripcion="Agregá tu primera sección con el botón Agregar sección"
            />
          ) : (
            <>
              {filasVisibles.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filasVisibles}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {filasVisibles.map((id) => resolverFila(id))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {hayOcultas && (
                <div className="mt-4 rounded-xl border border-dashed border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <EyeOff size={15} className="text-[var(--admin-texto-suave)]" />
                    <h4 className="text-sm font-semibold text-[var(--admin-texto)]">
                      Secciones ocultas
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {ocultasFijas.map((id) =>
                      id === "featured"
                        ? filaOculta({
                          id: "featured",
                          icono: Grid2X2,
                          titulo: "Sección destacada",
                          detalle: config.homegrid?.grids.length
                            ? `${config.homegrid.grids.length} tarjetas`
                            : "Sin configurar",
                          alMostrar: () => void toggleSeccionFija(id),
                        })
                        : filaOculta({
                          id: "location",
                          icono: MapPin,
                          titulo: "Ubicación",
                          detalle: config.address ?? "Sin dirección",
                          alMostrar: () => void toggleSeccionFija(id),
                        })
                    )}
                    {carruselesOcultos.map((carousel) => {
                      const label = ETIQUETAS_TIPO[carousel.type];
                      const cantidad = carousel.slides?.length ?? 0;
                      return filaOculta({
                        id: `hidden-carousel-${carousel.id}`,
                        icono: ICONOS_TIPO[carousel.type],
                        titulo: carousel.title || label,
                        detalle: `${label} · ${cantidad} slides`,
                        alMostrar: () =>
                          void toggleVisibilidadCarrusel(carousel),
                      });
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <SeccionPaginasDinamicas
          paginas={paginasDinamicas.filter(
            (p) => p.slug === paginaSeleccionada
          )}
        />
      )}

      <CarouselWizard
        isOpen={wizardAbierto}
        onClose={cerrarWizard}
        onSave={guardarWizard}
        initialData={datosInicialesWizard}
      />

      {settingsCarousel && (
        <CarouselSettingsModal
          isOpen={!!settingsCarousel}
          onClose={() => setSettingsCarousel(null)}
          carousel={settingsCarousel}
          onSave={actualizarCarouselLocal}
        />
      )}

      {designCarousel && (
        <CarouselDesignModal
          isOpen={!!designCarousel}
          onClose={() => setDesignCarousel(null)}
          carousel={designCarousel}
          onSave={actualizarCarouselLocal}
        />
      )}

      {eliminarId && (
        <ConfirmacionEliminarSeccion
          onCancelar={() => setEliminarId(null)}
          onConfirmar={() => void confirmarEliminacion()}
          primaryColor={config.primaryColor}
          secondaryColor={config.secondaryColor}
        />
      )}

      <DrawerSeccionDestacada
        abierto={drawerDestacada}
        alCerrar={() => setDrawerDestacada(false)}
        config={config}
        primaryColor={config.primaryColor}
        secondaryColor={config.secondaryColor}
      />

      <DrawerUbicacion
        abierto={drawerUbicacion}
        alCerrar={() => setDrawerUbicacion(false)}
        config={config}
        primaryColor={config.primaryColor}
        secondaryColor={config.secondaryColor}
      />
    </div>
  );
}
