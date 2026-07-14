// src/components/admin/page-config/CarouselSection.tsx
"use client";

import { useState, useEffect } from "react";
import { CarouselType } from "../../../../generated/prisma"
import { updateCarouselConfig } from "@/actions/page-config/carousel-config.actions";
import { getCarouselSlides } from "@/actions/page-config/carousel-slides.actions";
import CarouselTypeSelector from "./CarouselTypeSelector";
import SlidesList from "./SlidesList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Slide = Awaited<ReturnType<typeof getCarouselSlides>>[number];

interface CarouselSectionProps {
  initialConfig: {
    carouselType: CarouselType;
    carouselAutoplay: boolean;
    carouselInterval: number;
  };
}

export default function CarouselSection({ initialConfig }: CarouselSectionProps) {
  const [config, setConfig] = useState(initialConfig);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSlides = async () => {
    try {
      const data = await getCarouselSlides(1);
      setSlides(data);
    } catch (err) {
      toast.error("Error al cargar diapositivas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleSaveConfig = async () => {
    const formData = new FormData();
    formData.set("carouselType", config.carouselType);
    formData.set("carouselAutoplay", String(config.carouselAutoplay));
    formData.set("carouselInterval", String(config.carouselInterval));
    const result = await updateCarouselConfig(formData);
    if (result.error) toast.error(result.error);
    else toast.success("Configuración guardada");
  };

  const refreshSlides = () => loadSlides();

  return (
    <div className="space-y-8 bg-neutral-950/50 p-6 rounded-xl border border-neutral-900">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-cyan-400">Carrusel del Home</h3>
        <Button onClick={handleSaveConfig} variant="amarillo">
          Guardar configuración
        </Button>
      </div>

      <CarouselTypeSelector
        value={config.carouselType}
        onChange={(type) => setConfig({ ...config, carouselType: type })}
      />

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-neutral-300">
          <input
            type="checkbox"
            checked={config.carouselAutoplay}
            onChange={(e) => setConfig({ ...config, carouselAutoplay: e.target.checked })}
            className="accent-cyan-500"
          />
          Reproducción automática
        </label>
        <label className="flex items-center gap-2 text-neutral-300">
          Intervalo (ms):
          <input
            type="number"
            value={config.carouselInterval}
            onChange={(e) => setConfig({ ...config, carouselInterval: parseInt(e.target.value) || 6000 })}
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-24"
          />
        </label>
      </div>

      <SlidesList
        slides={slides}
        carouselType={config.carouselType}
        onSlidesChange={refreshSlides}
      />
    </div>
  );
}