export interface SelectorCategoria {
  id: string;
  label: string;
}

export interface SelectorProducto {
  id: string;
  label: string;
}

export interface DatosTarjeta {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  linkType: "NONE" | "CATEGORY" | "PRODUCT" | "EXTERNAL";
  linkValue: string;
  subtitleNeon: boolean;
  subtitleDim: boolean;
  linkStyle: "IMAGE" | "BUTTON";
  buttonVariant: "DEFAULT" | "STRAIGHT" | "TRANSPARENT";
  buttonText: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

export const LIMITES_TARJETA = {
  title: 60,
  subtitle: 120,
  boton: 50,
};

export const FORMULARIO_VACIO: DatosTarjeta = {
  title: "",
  subtitle: "",
  image: "",
  linkType: "NONE",
  linkValue: "",
  subtitleNeon: false,
  subtitleDim: false,
  linkStyle: "IMAGE",
  buttonVariant: "DEFAULT",
  buttonText: "",
  buttonBgColor: "",
  buttonTextColor: "",
};

export const OPCIONES_DESTINO = [
  { value: "NONE", label: "Sin enlace" },
  { value: "CATEGORY", label: "Categoría" },
  { value: "PRODUCT", label: "Producto" },
  { value: "EXTERNAL", label: "URL externa" },
];

export const OPCIONES_ENLACE = [
  { value: "IMAGE", label: "Imagen" },
  { value: "BUTTON", label: "Botón" },
];

export const OPCIONES_BOTON = [
  { value: "DEFAULT", label: "Predeterminado" },
  { value: "STRAIGHT", label: "Recto" },
  { value: "TRANSPARENT", label: "Transparente" },
];
