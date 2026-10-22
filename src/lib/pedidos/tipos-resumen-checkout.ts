export interface ItemResumenCheckout {
  clave: string;
  productId: string;
  variantId: string;
  nombre: string;
  variante: string | null;
  imagen: string | null;
  cantidad: number;
  precioUnitario: number;
  precioAnterior: number | null;
  subtotal: number;
}

export interface ResumenCheckout {
  items: ItemResumenCheckout[];
  subtotal: number;
  moneda: string;
}
