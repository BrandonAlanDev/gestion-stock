export interface ProductoParaCarrito {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  [propiedad: string]: unknown;
}

export interface ItemCarrito extends ProductoParaCarrito {
  uid: string;
  qty: number;
  variantId?: string;
  varianteInfo?: Record<string, string>;
  stock?: number;
}

export interface ValorContextoCarrito {
  cartItems: ItemCarrito[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (producto: ProductoParaCarrito, cantidad?: number) => void;
  updateQty: (uid: string, delta: number) => void;
  removeItem: (uid: string) => void;
}
