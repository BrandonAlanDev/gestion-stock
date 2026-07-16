import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "object" && value?.constructor?.name === "Decimal"
        ? value.toNumber()
        : value
    )
  );
}

export function getContrastColor(hexColor: string): string {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export function extractPublicId(url: string): string | null {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex !== -1) {
      const pathParts = parts.slice(uploadIndex + 2);
      const fileName = pathParts.join('/');
      return fileName.split('.')[0];
    }
  } catch (e) {
    console.error("Error extracting public ID", e);
  }
  return null;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}