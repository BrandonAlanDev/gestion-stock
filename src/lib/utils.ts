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