"use client";

import { useState, useCallback } from "react";
import { cn, getContrastColor, fileToBase64 } from "@/lib/utils";
import { compressImage } from "@/lib/image-utils";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  maxSizeMB?: number;
  primaryColor?: string;
  secondaryColor?: string;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  maxSizeMB = 5,
  primaryColor = "#06b6d4",
  secondaryColor = "#fafafa",
  label = "Seleccionar imagen",
}: ImageUploaderProps) {
  const textColor = getContrastColor(secondaryColor);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`La imagen supera los ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const compressedFile = await compressImage(file, 1200, 1200, 0.8);
        const base64 = await fileToBase64(compressedFile);

        setPreview(base64);
        onChange(base64);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al procesar la imagen");
      } finally {
        setUploading(false);
      }
    },
    [maxSizeMB, onChange]
  );

  const removeImage = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="sr-only"
            disabled={uploading}
          />
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
              uploading && "opacity-50 pointer-events-none"
            )}
            style={{
              backgroundColor: primaryColor + "1A",
              borderColor: primaryColor + "40",
              color: primaryColor,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "30"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; }}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {label}
              </>
            )}
          </div>
        </label>

        {preview && (
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: primaryColor + "40", backgroundColor: primaryColor + "10" }}>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: secondaryColor, color: textColor }}
              title="Eliminar imagen"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-xs" style={{ color: primaryColor }}>{error}</p>}
      {!preview && !error && (
        <p className="text-xs" style={{ color: textColor + "60" }}>PNG, JPG, WebP · máx {maxSizeMB}MB</p>
      )}
    </div>
  );
}
