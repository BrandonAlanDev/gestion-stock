export const TABLAS_TENANT = [
  "Banner", "BoardDeliveryOption", "BoardFinConfigOption", "BoardFinOption",
  "BoardMaterialOption", "BoardTailOption", "BoardTypeOption", "Carousel",
  "CarouselSlide", "Category", "Color", "ContactProvider", "CustomBoard",
  "CustomPages", "CustomPageSections", "CustomPageItems", "Garment",
  "GarmentImage", "GarmentVariant", "Grid", "Homegrid", "Movement",
  "PageConfig", "Provider", "Size", "SizeType", "SubCategory", "account", "user",
] as const;

export interface Puente {
  vieja: string;
  nueva: string;
  columnaRelacion: string;
  tablaRelacion: string;
}

export const PUENTES: readonly Puente[] = [
  { vieja: "_BoardTailOptionToBoardTypeOption", nueva: "BoardTypeTailOption", columnaRelacion: "tailId", tablaRelacion: "BoardTailOption" },
  { vieja: "_BoardFinOptionToBoardTypeOption", nueva: "BoardTypeFinOption", columnaRelacion: "finId", tablaRelacion: "BoardFinOption" },
  { vieja: "_BoardFinConfigOptionToBoardTypeOption", nueva: "BoardTypeFinConfigOption", columnaRelacion: "configId", tablaRelacion: "BoardFinConfigOption" },
];

export interface Relacion {
  nombre: string;
  hija: string;
  fk: string;
  padre: string;
}

export const RELACIONES: readonly Relacion[] = [
  { nombre: "account→user", hija: "account", fk: "userId", padre: "user" },
  { nombre: "Garment→Category", hija: "Garment", fk: "categoryId", padre: "Category" },
  { nombre: "Garment→SubCategory", hija: "Garment", fk: "subCategoryId", padre: "SubCategory" },
  { nombre: "Garment→Provider", hija: "Garment", fk: "supplierId", padre: "Provider" },
  { nombre: "SubCategory→Category", hija: "SubCategory", fk: "categoryId", padre: "Category" },
  { nombre: "SubCategory→SizeType", hija: "SubCategory", fk: "sizeTypeId", padre: "SizeType" },
  { nombre: "GarmentVariant→Garment", hija: "GarmentVariant", fk: "garmentId", padre: "Garment" },
  { nombre: "GarmentVariant→Size", hija: "GarmentVariant", fk: "sizeId", padre: "Size" },
  { nombre: "GarmentVariant→Color", hija: "GarmentVariant", fk: "colorId", padre: "Color" },
  { nombre: "GarmentImage→Garment", hija: "GarmentImage", fk: "garmentId", padre: "Garment" },
  { nombre: "Movement→GarmentVariant", hija: "Movement", fk: "variantId", padre: "GarmentVariant" },
  { nombre: "Size→SizeType", hija: "Size", fk: "sizeTypeId", padre: "SizeType" },
  { nombre: "ContactProvider→Provider", hija: "ContactProvider", fk: "idProvider", padre: "Provider" },
  { nombre: "Banner→PageConfig", hija: "Banner", fk: "pageConfigId", padre: "PageConfig" },
  { nombre: "Carousel→PageConfig", hija: "Carousel", fk: "pageConfigId", padre: "PageConfig" },
  { nombre: "CarouselSlide→Carousel", hija: "CarouselSlide", fk: "carouselId", padre: "Carousel" },
  { nombre: "Grid→Homegrid", hija: "Grid", fk: "homegridId", padre: "Homegrid" },
  { nombre: "PageConfig→Homegrid", hija: "PageConfig", fk: "homegridId", padre: "Homegrid" },
  { nombre: "Section→Page", hija: "CustomPageSections", fk: "pageId", padre: "CustomPages" },
  { nombre: "Item→Section", hija: "CustomPageItems", fk: "sectionId", padre: "CustomPageSections" },
];
