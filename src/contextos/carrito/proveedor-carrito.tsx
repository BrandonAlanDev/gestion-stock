"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { agregarAlCarrito } from "@/actions/carrito/agregar-al-carrito";
import { ContextoCarrito } from "@/contextos/carrito/contexto-carrito";
import type {
  ItemCarrito,
  ProductoParaCarrito,
} from "@/contextos/carrito/tipos-carrito";

function claveIdentidadCarrito(item: Pick<ItemCarrito, "id" | "variantId" | "varianteInfo">): string {
  const detalle = item.variantId
    ? ["variante", String(item.variantId)]
    : [
        "opciones",
        Object.entries(item.varianteInfo ?? {})
          .filter(([, valor]) => Boolean(valor))
          .sort(([grupoA], [grupoB]) => grupoA.localeCompare(grupoB)),
      ];

  return JSON.stringify([String(item.id), detalle]);
}

function consolidarItemsCarrito(items: ItemCarrito[]): ItemCarrito[] {
  const consolidados: ItemCarrito[] = [];

  for (const item of items) {
    const limpio = { ...item };
    delete limpio.adicionesPendientes;
    const cantidad = Math.max(1, Math.floor(Number(item.qty) || 1));
    const clave = claveIdentidadCarrito(limpio);
    const indiceExistente = consolidados.findIndex(
      (existente) => claveIdentidadCarrito(existente) === clave,
    );

    if (indiceExistente === -1) {
      consolidados.push({ ...limpio, qty: cantidad });
      continue;
    }

    const existente = consolidados[indiceExistente];
    consolidados[indiceExistente] = {
      ...existente,
      qty: existente.qty + cantidad,
      stock: existente.stock ?? limpio.stock,
    };
  }

  return consolidados;
}

function crearTokenAdicion(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface PropiedadesCartProvider {
  children: ReactNode;
}

export function CartProvider({ children }: PropiedadesCartProvider) {
  const claveCarrito = `cart:gestion-stock`;
  const claveMarcaTemporal = `cartTimestamp:gestion-stock`;
  const [cartItems, setCartItems] = useState<ItemCarrito[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [claveCargada, setClaveCargada] = useState<string | null>(null);
  const incrementosEnCurso = useRef(new Set<string>());

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(claveCarrito);
      const datos: unknown = guardado ? JSON.parse(guardado) : [];
      setCartItems(consolidarItemsCarrito(Array.isArray(datos) ? (datos as ItemCarrito[]) : []));
    } catch {
      localStorage.removeItem(claveCarrito);
      localStorage.removeItem(claveMarcaTemporal);
      setCartItems([]);
    } finally {
      setClaveCargada(claveCarrito);
    }
  }, [claveCarrito, claveMarcaTemporal]);

  useEffect(() => {
    if (claveCargada !== claveCarrito) return;

    try {
      const itemsConfirmados = cartItems.flatMap((item) => {
        const cantidadPendiente = item.adicionesPendientes?.reduce(
          (total, adicion) => total + adicion.cantidad,
          0,
        ) ?? 0;
        const cantidadConfirmada = item.qty - cantidadPendiente;
        if (cantidadConfirmada <= 0) return [];

        const persistible = { ...item, qty: cantidadConfirmada };
        delete persistible.adicionesPendientes;
        return [persistible];
      });
      localStorage.setItem(claveCarrito, JSON.stringify(itemsConfirmados));
      localStorage.setItem(claveMarcaTemporal, String(Date.now()));
    } catch {
      // El carrito continúa disponible en memoria si el navegador bloquea storage.
    }
  }, [cartItems, claveCarrito, claveCargada, claveMarcaTemporal]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (producto: ProductoParaCarrito, cantidad: number = 1) => {
      const token = crearTokenAdicion();
      const cantidadAgregar = Math.max(1, Math.floor(cantidad));
      const nuevoItem: ItemCarrito = {
        ...producto,
        uid: `${producto.id}-${crearTokenAdicion()}`,
        qty: cantidadAgregar,
        adicionesPendientes: [{ token, cantidad: cantidadAgregar }],
      };

      setCartItems((anteriores) => {
        const clave = claveIdentidadCarrito(nuevoItem);
        const existente = anteriores.find(
          (item) => claveIdentidadCarrito(item) === clave,
        );

        if (!existente) return [...anteriores, nuevoItem];

        return anteriores.map((item) => item.uid === existente.uid
          ? {
              ...item,
              qty: item.qty + cantidadAgregar,
              adicionesPendientes: [
                ...(item.adicionesPendientes ?? []),
                { token, cantidad: cantidadAgregar },
              ],
            }
          : item,
        );
      });
      return token;
    },
    []
  );

  const confirmarAdicion = useCallback((token: string, stock?: number) => {
    setCartItems((anteriores) => anteriores.map((item) => {
      const pendientes = item.adicionesPendientes ?? [];
      if (!pendientes.some((adicion) => adicion.token === token)) return item;

      return {
        ...item,
        stock,
        adicionesPendientes: pendientes.filter((adicion) => adicion.token !== token),
      };
    }));
  }, []);

  const revertirAdicion = useCallback((token: string) => {
    setCartItems((anteriores) => anteriores.flatMap((item) => {
      const pendientes = item.adicionesPendientes ?? [];
      const adicion = pendientes.find((pendiente) => pendiente.token === token);
      if (!adicion) return [item];

      const cantidad = item.qty - adicion.cantidad;
      if (cantidad <= 0) return [];

      return [{
        ...item,
        qty: cantidad,
        adicionesPendientes: pendientes.filter((pendiente) => pendiente.token !== token),
      }];
    }));
  }, []);

  const updateQty = useCallback((uid: string, delta: number) => {
    const ajuste = Math.trunc(delta);
    if (ajuste === 0) return;

    if (ajuste < 0) {
      setCartItems((anteriores) => anteriores.map((item) =>
        item.uid === uid && (item.adicionesPendientes?.length ?? 0) === 0
          ? { ...item, qty: Math.max(1, item.qty + ajuste) }
          : item
      ));
      return;
    }

    const item = cartItems.find((actual) => actual.uid === uid);
    if (!item || (item.adicionesPendientes?.length ?? 0) > 0 || incrementosEnCurso.current.has(uid)) return;

    const cantidad = item.qty + ajuste;
    if (!item.variantId) {
      setCartItems((anteriores) => anteriores.map((actual) =>
        actual.uid === uid && (actual.adicionesPendientes?.length ?? 0) === 0
          ? {
              ...actual,
              qty: Math.max(1, actual.stock != null ? Math.min(actual.stock, cantidad) : cantidad),
            }
          : actual
      ));
      return;
    }

    incrementosEnCurso.current.add(uid);
    void agregarAlCarrito({
      productId: String(item.id),
      variantId: item.variantId,
      cantidad,
    }).then((resultado) => {
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      setCartItems((anteriores) => anteriores.map((actual) =>
        actual.uid === uid && (actual.adicionesPendientes?.length ?? 0) === 0
          ? {
              ...actual,
              qty: cantidad,
              stock: resultado.controlaStock ? resultado.stock : undefined,
            }
          : actual
      ));
    }).catch(() => {
      toast.error("No se pudo validar la disponibilidad. Intentá de nuevo.");
    }).finally(() => {
      incrementosEnCurso.current.delete(uid);
    });
  }, [cartItems]);

  const removeItem = useCallback((uid: string) => {
    setCartItems((anteriores) =>
      anteriores.filter((item) => item.uid !== uid)
    );
    toast.info("Producto eliminado del carrito");
  }, []);

  const valor = useMemo(
    () => ({
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      confirmarAdicion,
      revertirAdicion,
      updateQty,
      removeItem,
    }),
    [
      addToCart,
      cartItems,
      closeCart,
      confirmarAdicion,
      isCartOpen,
      openCart,
      removeItem,
      revertirAdicion,
      updateQty,
    ]
  );

  return (
    <ContextoCarrito.Provider value={valor}>
      {children}
    </ContextoCarrito.Provider>
  );
}
