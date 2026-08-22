"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { toast } from "sonner";

import {
  createCarousel,
  deleteCarousel,
  duplicateCarousel,
  getAllCarousels,
  updateCarousel,
  updateCarouselActive,
} from "@/actions/carousel/carousel.actions";
import { updateSectionOrder } from "@/actions/page-config/order.actions";
import type { Carousel, CarouselWizardData } from "@/types/carousel";

import { normalizarSecciones } from "./normalizarSecciones";

function ordenPersistido(rawOrder: string | null): string[] {
  if (!rawOrder) return [];
  try {
    const datos: unknown = JSON.parse(rawOrder);
    return Array.isArray(datos)
      ? datos.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function ordenarPorOrder(carousels: Carousel[]): Carousel[] {
  return [...carousels].sort((a, b) => a.order - b.order);
}

export default function useGestorContenido(sectionOrder: string | null) {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [filas, setFilas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paginaSeleccionada, setPaginaSeleccionada] = useState("inicio");
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [carouselEditando, setCarouselEditando] = useState<Carousel | null>(
    null
  );
  const [settingsCarousel, setSettingsCarousel] = useState<Carousel | null>(
    null
  );
  const [designCarousel, setDesignCarousel] = useState<Carousel | null>(null);
  const [eliminarId, setEliminarId] = useState<string | null>(null);
  const [drawerDestacada, setDrawerDestacada] = useState(false);
  const [drawerUbicacion, setDrawerUbicacion] = useState(false);

  const filasRef = useRef(filas);
  useEffect(() => {
    filasRef.current = filas;
  }, [filas]);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const res = await getAllCarousels();
        if (!activo) return;
        if (res.success && res.data) {
          const datos = ordenarPorOrder(res.data as Carousel[]);
          const normalizadas = normalizarSecciones(datos, sectionOrder);
          setCarousels(datos);
          setFilas(normalizadas);
          const persistido = ordenPersistido(sectionOrder);
          if (JSON.stringify(normalizadas) !== JSON.stringify(persistido)) {
            const resOrden = await updateSectionOrder(normalizadas);
            if (resOrden.success) toast.info("Secciones sincronizadas");
          }
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
  }, [sectionOrder]);

  useEffect(() => {
    if (cargando || filasRef.current.length === 0) return;
    const normalizadas = normalizarSecciones(
      carousels,
      JSON.stringify(filasRef.current)
    );
    if (JSON.stringify(normalizadas) === JSON.stringify(filasRef.current)) {
      return;
    }
    setFilas(normalizadas);
    void updateSectionOrder(normalizadas).then((res) => {
      if (res.success) toast.info("Secciones sincronizadas");
      else toast.error(res.error || "Error al sincronizar secciones");
    });
  }, [carousels, cargando]);

  const carouselPorId = useMemo(() => {
    return new Map(carousels.map((c) => [c.id, c]));
  }, [carousels]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const recargarCarousels = async () => {
    const res = await getAllCarousels();
    if (res.success && res.data) {
      setCarousels(ordenarPorOrder(res.data as Carousel[]));
    }
  };

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

  const toggleSeccionFija = async (id: string) => {
    const agregar = !filas.includes(id);
    let siguiente: string[];
    if (agregar) {
      if (id === "featured") {
        const idx = filas.indexOf("location");
        const en = idx >= 0 ? idx : filas.length;
        siguiente = [...filas.slice(0, en), id, ...filas.slice(en)];
      } else {
        siguiente = [...filas, id];
      }
    } else {
      siguiente = filas.filter((s) => s !== id);
    }
    setFilas(siguiente);

    const res = await updateSectionOrder(siguiente);
    if (res.success) {
      toast.success(
        agregar ? "Sección agregada a la página" : "Sección ocultada"
      );
    } else {
      toast.error(res.error || "Error al guardar");
      setFilas(filas);
    }
  };

  const guardarWizard = async (wizardData: CarouselWizardData) => {
    try {
      if (wizardData.id) {
        const res = await updateCarousel(wizardData);
        if (res.success && res.data) {
          const actualizado = res.data as Carousel;
          setCarousels((prev) =>
            prev.map((c) => (c.id === actualizado.id ? actualizado : c))
          );
          toast.success("Carrusel actualizado");
        } else {
          toast.error(res.error);
          return;
        }
      } else {
        const res = await createCarousel(wizardData);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Carrusel creado");
      }
      setWizardAbierto(false);
      setCarouselEditando(null);
      await recargarCarousels();
    } catch {
      toast.error("Error al guardar el carrusel");
    }
  };

  const duplicarCarrusel = async (id: string) => {
    const res = await duplicateCarousel(id);
    if (res.success) {
      toast.success("Sección duplicada");
      await recargarCarousels();
    } else {
      toast.error(res.error);
    }
  };

  const confirmarEliminacion = async () => {
    if (!eliminarId) return;
    const id = eliminarId;
    setEliminarId(null);

    const res = await deleteCarousel(id);
    if (res.success) {
      setFilas((prev) => prev.filter((s) => s !== `carousel_${id}`));
      toast.success("Sección eliminada");
      await recargarCarousels();
    } else {
      toast.error(res.error);
    }
  };

  const toggleVisibilidadCarrusel = async (carousel: Carousel) => {
    const res = await updateCarouselActive(carousel.id, !carousel.active);
    if (res.success) {
      setCarousels((prev) =>
        prev.map((c) =>
          c.id === carousel.id ? { ...c, active: !carousel.active } : c
        )
      );
      toast.success(carousel.active ? "Sección ocultada" : "Sección visible");
    } else {
      toast.error(res.error);
    }
  };

  const actualizarCarouselLocal = (carousel: Carousel) => {
    setCarousels((prev) =>
      prev.map((c) => (c.id === carousel.id ? carousel : c))
    );
  };

  const abrirWizardNuevo = () => {
    setCarouselEditando(null);
    setWizardAbierto(true);
  };

  const abrirEdicionCarrusel = (carousel: Carousel) => {
    setCarouselEditando(carousel);
    setWizardAbierto(true);
  };

  const cerrarWizard = () => {
    setWizardAbierto(false);
    setCarouselEditando(null);
  };

  const datosInicialesWizard = useMemo(() => {
    if (!carouselEditando) return null;
    return {
      id: carouselEditando.id,
      type: carouselEditando.type,
      title: carouselEditando.title || "",
      settings: carouselEditando.settings || {},
      slides: (carouselEditando.slides || []).map((s) => ({
        id: s.id,
        image: s.image || "",
        title: s.title || "",
        subtitle: s.subtitle || "",
        description: s.description || "",
        ctaText: s.ctaText || "",
        url: s.url || "",
        order: s.order,
        isNew: false,
        linkType: (s.config?.linkType as string) || "",
      })),
    };
  }, [carouselEditando]);

  return {
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
  };
}
