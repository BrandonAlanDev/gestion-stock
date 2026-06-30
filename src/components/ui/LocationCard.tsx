"use client";

import { useState } from "react";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface LocationCardProps {
  title?: string;
  days?: string;
  hours?: string;
  config: {
    address: string | null;
    city: string | null;
    province?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    mapsUrl?: string | null;
  };
}

export default function LocationCard({
  title = "Nuestra Ubicación",
  days = "Lunes a Viernes",
  hours = "09:00 - 18:00",
  config,
}: LocationCardProps) {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  
  // Estado añadido para corregir el ReferenceError
  const [isHovered, setIsHovered] = useState(false);
  
  const { address, city, province, phone, whatsapp, mapsUrl } = config;

  if (!address) return null;

  const handleDirectionsClick = () => {
    if (mapsUrl) {
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } else {
      const fullAddress = `${address}${city ? `, ${city}` : ""}${province ? `, ${province}` : ""}`;
      const encodedAddress = encodeURIComponent(fullAddress);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
    }
  };

  const contactPhone = whatsapp || phone;

  return (
    <div 
      className="w-full max-w-md p-6 shadow-xl border border-neutral-200 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: "#ffffff",
        borderRadius: "24px",
        boxShadow: isHovered ? `0 20px 25px -5px ${primaryColor}30` : undefined
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-neutral-100">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
          <MapPin size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic text-neutral-800">
            {title}
          </h3>
          {city && (
            <p className="text-sm font-semibold" style={{ color: primaryColor }}>
              {city}{province ? `, ${province}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Detalles del Lugar */}
      <div className="space-y-4 my-5 text-sm">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
          <span className="font-medium text-neutral-700">
            {address}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={18} className="mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
          <div>
            <p className="font-bold text-neutral-700">{days}</p>
            <p className="text-xs text-neutral-500">{hours}</p>
          </div>
        </div>

        {contactPhone && (
          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
            <a 
              href={`tel:${contactPhone.replace(/\s+/g, '')}`} 
              className="font-medium hover:underline text-neutral-700 transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = "#404040"}
            >
              {contactPhone}
            </a>
          </div>
        )}
      </div>

      {/* Botón de Cómo Llegar */}
      <button
        type="button"
        onClick={handleDirectionsClick}
        className="w-full py-3 font-black uppercase flex items-center justify-center gap-2 transition-all group cursor-pointer"
        style={{
          backgroundColor: primaryColor,
          color: "#ffffff",
          borderRadius: "14px",
          fontSize: "13px",
        }}
        onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
      >
        <Navigation size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        Cómo llegar
      </button>
    </div>
  );
}