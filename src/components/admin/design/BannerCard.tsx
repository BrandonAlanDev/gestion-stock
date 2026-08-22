"use client";

import { toast } from "sonner";
import { deleteBanner } from "@/actions/page-config/branding.actions";
import ImageUploader from "@/components/admin/page-config/shared/ImageUploader";
import Input from "@/components/admin/page-config/shared/Input";
import Textarea from "@/components/admin/page-config/shared/Textarea";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

interface BannerData {
  id?: number;
  image: string;
  title: string;
  subtitle: string;
  text: string;
  url: string;
}

export default function BannerCard({
  banner,
  index,
  onChange,
  onRemove,
  primaryColor,
  secondaryColor,
}: {
  banner: BannerData;
  index: number;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 900, color: getContrastColor(secondaryColor) }}>
          Banner {index + 1}
        </h3>
        <button
          onClick={async () => {
            if (!confirm("¿Estás seguro que deseas eliminar este banner?")) return;
            if (!banner.id) return;
            const res = await deleteBanner(banner.id);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            onRemove(index);
            toast.success("Banner eliminado");
          }}
          style={{
            backgroundColor: "#dc2626",
            color: "#fff",
            border: `2px solid #dc2626`,
            borderRadius: 14,
            padding: "10px 18px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Eliminar
        </button>
      </div>

      <ImageUploader
        label="Imagen"
        value={banner.image}
        onChange={(v) => onChange(index, "image", v)}
      />

      <Input
        label="Título"
        value={banner.title}
        onChange={(v) => onChange(index, "title", v)}
      />

      <Input
        label="Subtítulo"
        value={banner.subtitle}
        onChange={(v) => onChange(index, "subtitle", v)}
      />

      <Textarea
        label="Texto"
        value={banner.text}
        onChange={(v) => onChange(index, "text", v)}
      />

      <Input
        label="URL"
        value={banner.url}
        onChange={(v) => onChange(index, "url", v)}
      />
    </div>
  );
}
