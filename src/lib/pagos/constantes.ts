// Definiciones estáticas de los métodos de pago conocidos por la plataforma.
// No exporta funciones; solo datos.

import type { DefinicionMetodoPago } from "@/lib/pagos/tipos";

export const METODOS_PAGO_CONOCIDOS: DefinicionMetodoPago[] = [
  {
    id: "efectivo",
    nombre: "Efectivo",
    descripcion: "Pagá en efectivo al retirar tu pedido en la tienda.",
    requiereConexion: false,
    requiereConfiguracion: false,
  },
  {
    id: "transferencia",
    nombre: "Transferencia bancaria",
    descripcion: "Permití pagar mediante transferencia.",
    requiereConexion: false,
    requiereConfiguracion: true,
  },
  {
    id: "mercadopago",
    nombre: "Mercado Pago",
    descripcion: "Aceptá pagos online de forma segura.",
    requiereConexion: true,
    requiereConfiguracion: false,
  },
];
