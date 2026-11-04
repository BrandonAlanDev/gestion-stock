export interface ProductoParaCarrito {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  stock?: number;
  [propiedad: string]: unknown;
}

export interface ItemCarrito extends ProductoParaCarrito {
  uid: string;
  qty: number;
  variantId?: string;
  varianteInfo?: Record<string, string>;
  adicionesPendientes?: { token: string; cantidad: number }[];
}

export interface ValorContextoCarrito {
  cartItems: ItemCarrito[];
  cartLoaded: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (producto: ProductoParaCarrito, cantidad?: number) => string;
  confirmarAdicion: (token: string, stock?: number) => void;
  revertirAdicion: (token: string) => void;
  updateQty: (uid: string, delta: number) => void;
  removeItem: (uid: string) => void;
}
