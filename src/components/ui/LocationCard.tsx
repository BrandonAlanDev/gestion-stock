"use client";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

interface LocationCardProps {
  title?: string;
  address: string;
  city: string;
  hours: string;
  days: string;
  phone?: string;
  googleMapsUrl?: string;
}

export default function LocationCard({
  title = "Nuestra Ubicación",
  address,
  city,
  hours,
  days,
  phone,
  googleMapsUrl,
}: LocationCardProps) {
  
  const handleDirectionsClick = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    } else {
      const encodedAddress = encodeURIComponent(`${address}, ${city}`);
      window.open(`http://googleusercontent.com/maps.google.com/${encodedAddress}`, "_blank");
    }
  };

  return (
    <div 
      className="w-full max-w-md p-6 shadow-xl border border-neutral-200 transition-all hover:shadow-2xl hover:shadow-cyan-500/5"
      style={{ 
        background: "#ffffff", // Fondo Blanco
        borderRadius: "24px" 
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-neutral-100">
        <div className="p-3 rounded-xl bg-cyan-50 text-cyan-500">
          <MapPin size={24} className="animate-bounce" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic text-neutral-800">
            {title}
          </h3>
          <p className="text-sm font-semibold text-cyan-600">
            {city}
          </p>
        </div>
      </div>

      {/* Detalles del Lugar */}
      <div className="space-y-4 my-5 text-sm">
        {/* Dirección */}
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 flex-shrink-0 text-cyan-500" />
          <span className="font-medium text-neutral-700">
            {address}
          </span>
        </div>

        {/* Horarios */}
        <div className="flex items-start gap-3">
          <Clock size={18} className="mt-0.5 flex-shrink-0 text-cyan-500" />
          <div>
            <p className="font-bold text-neutral-700">{days}</p>
            <p className="text-xs text-neutral-500">{hours}</p>
          </div>
        </div>

        {/* Teléfono (Opcional) */}
        {phone && (
          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 flex-shrink-0 text-cyan-500" />
            <a 
              href={`tel:${phone.replace(/\s+/g, '')}`} 
              className="font-medium hover:underline text-neutral-700 hover:text-cyan-600 transition-colors" 
            >
              {phone}
            </a>
          </div>
        )}
      </div>

      {/* Botón de Cómo Llegar (Cian con texto blanco) */}
      <button
        type="button"
        onClick={handleDirectionsClick}
        className="w-full py-3 font-black uppercase flex items-center justify-center gap-2 transition-all group cursor-pointer"
        style={{
          background: "#06b6d4", // cyan-500
          color: "#ffffff",      // Texto blanco
          borderRadius: "14px",
          fontSize: "13px",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#0891b2"; // cyan-600
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#06b6d4"; // cyan-500
        }}
      >
        <Navigation size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        Cómo llegar
      </button>
    </div>
  );
}