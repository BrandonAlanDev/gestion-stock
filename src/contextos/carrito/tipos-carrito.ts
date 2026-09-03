export interface ProductoParaCarrito {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  specs?: Record<string, unknown>;
  esTabla?: boolean;
  [propiedad: string]: unknown;
}

export interface ItemCarrito extends ProductoParaCarrito {
  uid: string;
  qty: number;
}

export interface ValorContextoCarrito {
  cartItems: ItemCarrito[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (producto: ProductoParaCarrito) => void;
  updateQty: (uid: string, delta: number) => void;
  removeItem: (uid: string) => void;
  updateCartItemSpecs: (
    uid: string,
    nuevasEspecificaciones: Record<string, unknown>
  ) => void;
}
