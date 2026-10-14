import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function combinarClases(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}
