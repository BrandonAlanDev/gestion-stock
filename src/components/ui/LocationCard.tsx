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
      // Si no hay URL específica, busca directamente la dirección en Google Maps
      const encodedAddress = encodeURIComponent(`${address}, ${city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
    }
  };

  return (
    <div 
      className="w-full max-w-md p-6 shadow-xl border transition-all hover:shadow-2xl"
      style={{ 
        background: "#ffffff", 
        borderColor: "#b2dede", 
        borderRadius: "24px" 
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: "#b2dede" }}>
        <div className="p-3 rounded-xl" style={{ background: "#f0fafa", color: "#0d5c63" }}>
          <MapPin size={24} className="animate-bounce" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic" style={{ color: "#083d42" }}>
            {title}
          </h3>
          <p className="text-sm font-semibold" style={{ color: "#4a7c80" }}>
            {city}
          </p>
        </div>
      </div>

      {/* Detalles del Lugar */}
      <div className="space-y-4 my-5 text-sm">
        {/* Dirección */}
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#0d5c63" }} />
          <span className="font-medium" style={{ color: "#0d2b2e" }}>
            {address}
          </span>
        </div>

        {/* Horarios */}
        <div className="flex items-start gap-3">
          <Clock size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#0d5c63" }} />
          <div>
            <p className="font-bold" style={{ color: "#0d2b2e" }}>{days}</p>
            <p className="text-xs" style={{ color: "#4a7c80" }}>{hours}</p>
          </div>
        </div>

        {/* Teléfono (Opcional) */}
        {phone && (
          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#0d5c63" }} />
            <a 
              href={`tel:${phone.replace(/\s+/g, '')}`} 
              className="font-medium hover:underline transition-all" 
              style={{ color: "#0d2b2e" }}
            >
              {phone}
            </a>
          </div>
        )}
      </div>

      {/* Botón de Cómo Llegar */}
      <button
        type="button"
        onClick={handleDirectionsClick}
        className="w-full py-3 font-black uppercase flex items-center justify-center gap-2 transition-all group"
        style={{
          background: "#0d5c63",
          color: "#ffffff",
          borderRadius: "14px",
          fontSize: "13px",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#083d42")}
        onMouseLeave={e => (e.currentTarget.style.background = "#0d5c63")}
      >
        <Navigation size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        Cómo llegar
      </button>
    </div>
  );
}