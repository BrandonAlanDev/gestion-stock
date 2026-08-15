"use client";

import { ShoppingCart } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateEcommerceConfig } from "@/actions/page-config/ecommerce.actions";
import Switch from "@/components/ui/switch";

import type { ConfigAjustes } from "./tipos-ajustes";

interface EstadoTienda {
  ecommerceEnabled: boolean;
  cartEnabled: boolean;
  checkoutEnabled: boolean;
}

type CampoTienda = keyof EstadoTienda;

export default function SeccionTiendaOnline({
  config,
}: {
  config: ConfigAjustes;
}) {
  const [estado, setEstado] = useState<EstadoTienda>({
    ecommerceEnabled: config.ecommerceEnabled,
    cartEnabled: config.cartEnabled,
    checkoutEnabled: config.checkoutEnabled,
  });

  const cambiar = (campo: CampoTienda, valor: boolean) => {
    const nuevoEstado = { ...estado, [campo]: valor };
    setEstado(nuevoEstado);

    startTransition(async () => {
      const resultado = await updateEcommerceConfig(nuevoEstado);

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      toast.success("Cambios guardados");
    });
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Tienda online</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Activá o desactivá funciones de compra
        </p>
      </div>

      <div className="divide-y divide-[var(--admin-borde)] px-5">
        <Switch
          activo={estado.ecommerceEnabled}
          alCambiar={(valor) => cambiar("ecommerceEnabled", valor)}
          etiqueta="Tienda online"
          descripcion="Permite comprar productos desde el sitio"
        />
        <Switch
          activo={estado.cartEnabled}
          alCambiar={(valor) => cambiar("cartEnabled", valor)}
          etiqueta="Carrito de compras"
          descripcion="Los usuarios pueden acumular productos"
        />
        <Switch
          activo={estado.checkoutEnabled}
          alCambiar={(valor) => cambiar("checkoutEnabled", valor)}
          etiqueta="Pago al finalizar"
          descripcion="Checkout con envío del pedido"
        />
      </div>
    </section>
  );
}
