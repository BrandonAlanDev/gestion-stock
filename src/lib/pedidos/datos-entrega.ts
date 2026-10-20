import { z } from "zod";

const texto = (maximo: number) => z.string().trim().min(1).max(maximo);

export const esquemaDatosEntrega = z.discriminatedUnion("metodoEntrega", [
  z.object({
    metodoEntrega: z.literal("DOMICILIO"),
    nombre: texto(100),
    apellido: texto(100),
    telefono: texto(40),
    destinatario: texto(191),
    calle: texto(191),
    numero: texto(40),
    piso: z.string().trim().max(40).optional(),
    departamento: z.string().trim().max(40).optional(),
    codigoPostal: texto(20),
    localidad: texto(191),
    provincia: texto(191),
    referencias: z.string().trim().max(1000).optional(),
  }),
  z.object({
    metodoEntrega: z.literal("RETIRO_TIENDA"),
    nombre: texto(100),
    apellido: texto(100),
    telefono: texto(40),
  }),
]);

export type DatosEntrega = z.infer<typeof esquemaDatosEntrega>;
