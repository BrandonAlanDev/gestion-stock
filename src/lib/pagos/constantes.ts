// Definiciones estáticas de los métodos de pago conocidos por la plataforma.
// No exporta funciones; solo datos.

import type { DefinicionMetodoPago } from "@/lib/pagos/tipos";

export const METODOS_PAGO_CONOCIDOS: DefinicionMetodoPago[] = [
  {
    id: "mercadopago",
    nombre: "Mercado Pago",
    descripcion: "Aceptá pagos online de forma segura.",
    requiereConexion: true,
  },
  {
    id: "transferencia",
    nombre: "Transferencia bancaria",
    descripcion: "Permití pagar mediante transferencia.",
    requiereConexion: false,
  },
];
