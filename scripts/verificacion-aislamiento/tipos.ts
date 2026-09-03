import type { PrismaClient } from "../../generated/prisma/client";

export interface ContextoVerificacion {
  cliente: PrismaClient;
  tenantA: string;
  tenantB: string;
  slugA: string;
  slugB: string;
  categoriaA: string;
  categoriaB: string;
  productoA: string;
  productoB: string;
  usuarioA: string;
  usuarioB: string;
}

export interface ResultadoCaso {
  nombre: string;
  correcto: boolean;
  detalle?: string;
}
