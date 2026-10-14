import { normalizarEnlaceNavegable } from "@/lib/enlaces/normalizar-enlace-navegable";

export interface DatosGrid {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  subtitleNeon?: boolean;
  subtitleDim?: boolean;
  linkStyle?: string;
  buttonVariant?: string;
  buttonText?: string | null;
  buttonBgColor?: string | null;
  buttonTextColor?: string | null;
  image: string;
  linkType?: string;
  linkValue?: string | null;
}

export interface TarjetaDestacada {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  subtitleNeon: boolean;
  subtitleDim: boolean;
  linkStyle: string;
  buttonVariant: string;
  buttonText: string;
  buttonBgColor: string;
  buttonTextColor: string;
  image: string;
}

export default function mapearGridATarjeta(grid: DatosGrid): TarjetaDestacada {
  let href = "#";
  switch (grid.linkType) {
    case "CATEGORY":
      href = grid.linkValue ? `/productos?categoria=${encodeURIComponent(grid.linkValue)}` : "#";
      break;
    case "PRODUCT":
      href = grid.linkValue ? `/productos/item/${encodeURIComponent(grid.linkValue)}` : "#";
      break;
    case "PAGE":
      href = grid.linkValue && /^\/(?!\/)/.test(grid.linkValue.trim())
        ? grid.linkValue.trim()
        : "#";
      break;
    case "EXTERNAL":
      href = normalizarEnlaceNavegable(grid.linkValue) ?? "#";
      break;
    case "NONE":
    default:
      href = "#";
  }
  return {
    id: grid.id,
    label: grid.title || "",
    sublabel: grid.subtitle || "",
    subtitleNeon: grid.subtitleNeon || false,
    subtitleDim: grid.subtitleDim || false,
    linkStyle: grid.linkStyle || "IMAGE",
    buttonVariant: grid.buttonVariant || "DEFAULT",
    buttonText: grid.buttonText || "",
    buttonBgColor: grid.buttonBgColor || "",
    buttonTextColor: grid.buttonTextColor || "",
    image: grid.image,
    href,
  };
}
