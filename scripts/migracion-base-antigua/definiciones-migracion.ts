export type TipoClave = "cadena" | "entero";

export interface ReferenciaMigracion {
  columna: string;
  tablaPadre: string;
  opcional?: boolean;
}

export interface DefinicionTablaMigracion {
  origen: string;
  destino: string;
  clave: string;
  tipoClave: TipoClave;
  referencias: readonly ReferenciaMigracion[];
}

export interface DefinicionPuenteMigracion {
  origen: string;
  destino: string;
  tablaBoard: string;
  tablaRelacion: string;
  columnaRelacion: string;
}

export const TABLAS_MIGRACION: readonly DefinicionTablaMigracion[] = [
  { origen: "Category", destino: "Category", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "SizeType", destino: "SizeType", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "Color", destino: "Color", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "Provider", destino: "Provider", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "BoardTypeOption", destino: "BoardTypeOption", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "BoardMaterialOption", destino: "BoardMaterialOption", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "BoardTailOption", destino: "BoardTailOption", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "BoardFinOption", destino: "BoardFinOption", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "BoardDeliveryOption", destino: "BoardDeliveryOption", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "BoardFinConfigOption", destino: "BoardFinConfigOption", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "CustomBoard", destino: "CustomBoard", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "Homegrid", destino: "Homegrid", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "Size", destino: "Size", clave: "id", tipoClave: "cadena", referencias: [{ columna: "sizeTypeId", tablaPadre: "SizeType" }] },
  { origen: "ContactProvider", destino: "ContactProvider", clave: "id", tipoClave: "cadena", referencias: [{ columna: "idProvider", tablaPadre: "Provider" }] },
  { origen: "SubCategory", destino: "SubCategory", clave: "id", tipoClave: "cadena", referencias: [{ columna: "categoryId", tablaPadre: "Category" }, { columna: "sizeTypeId", tablaPadre: "SizeType", opcional: true }] },
  { origen: "Garment", destino: "Garment", clave: "id", tipoClave: "cadena", referencias: [{ columna: "categoryId", tablaPadre: "Category" }, { columna: "subCategoryId", tablaPadre: "SubCategory", opcional: true }, { columna: "supplierId", tablaPadre: "Provider", opcional: true }] },
  { origen: "GarmentImage", destino: "GarmentImage", clave: "id", tipoClave: "cadena", referencias: [{ columna: "garmentId", tablaPadre: "Garment" }] },
  { origen: "GarmentVariant", destino: "GarmentVariant", clave: "id", tipoClave: "cadena", referencias: [{ columna: "garmentId", tablaPadre: "Garment" }, { columna: "sizeId", tablaPadre: "Size", opcional: true }, { columna: "colorId", tablaPadre: "Color", opcional: true }] },
  { origen: "Movement", destino: "Movement", clave: "id", tipoClave: "cadena", referencias: [{ columna: "variantId", tablaPadre: "GarmentVariant" }] },
  { origen: "Grid", destino: "Grid", clave: "id", tipoClave: "cadena", referencias: [{ columna: "homegridId", tablaPadre: "Homegrid" }] },
  { origen: "PageConfig", destino: "PageConfig", clave: "id", tipoClave: "entero", referencias: [{ columna: "homegridId", tablaPadre: "Homegrid", opcional: true }] },
  { origen: "Banner", destino: "Banner", clave: "id", tipoClave: "entero", referencias: [{ columna: "pageConfigId", tablaPadre: "PageConfig" }] },
  { origen: "Carousel", destino: "Carousel", clave: "id", tipoClave: "cadena", referencias: [{ columna: "pageConfigId", tablaPadre: "PageConfig" }] },
  { origen: "CarouselSlide", destino: "CarouselSlide", clave: "id", tipoClave: "cadena", referencias: [{ columna: "carouselId", tablaPadre: "Carousel" }] },
  { origen: "CustomPages", destino: "CustomPages", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "CustomPageSections", destino: "CustomPageSections", clave: "id", tipoClave: "cadena", referencias: [{ columna: "pageId", tablaPadre: "CustomPages" }] },
  { origen: "CustomPageItems", destino: "CustomPageItems", clave: "id", tipoClave: "cadena", referencias: [{ columna: "sectionId", tablaPadre: "CustomPageSections" }] },
  { origen: "user", destino: "user", clave: "id", tipoClave: "cadena", referencias: [] },
  { origen: "account", destino: "account", clave: "id", tipoClave: "cadena", referencias: [{ columna: "userId", tablaPadre: "user" }] },
];

export const PUENTES_MIGRACION: readonly DefinicionPuenteMigracion[] = [
  { origen: "_BoardTailOptionToBoardTypeOption", destino: "BoardTypeTailOption", tablaBoard: "BoardTypeOption", tablaRelacion: "BoardTailOption", columnaRelacion: "tailId" },
  { origen: "_BoardFinOptionToBoardTypeOption", destino: "BoardTypeFinOption", tablaBoard: "BoardTypeOption", tablaRelacion: "BoardFinOption", columnaRelacion: "finId" },
  { origen: "_BoardFinConfigOptionToBoardTypeOption", destino: "BoardTypeFinConfigOption", tablaBoard: "BoardTypeOption", tablaRelacion: "BoardFinConfigOption", columnaRelacion: "configId" },
];
