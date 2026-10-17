import "dotenv/config";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { conPrismaTenant } from "../src/lib/prisma";

const entrada = z.object({
  email: z.string().trim().email().transform((valor) => valor.toLowerCase()),
  password: z.string().min(12),
  name: z.string().trim().min(2),
  tenantId: z.string().trim().min(1),
}).safeParse({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME ?? "Administrador",
  tenantId: process.env.ADMIN_TENANT_ID,
});

async function main(): Promise<void> {
  if (!entrada.success) {
    throw new Error("Configurá ADMIN_TENANT_ID, ADMIN_EMAIL, ADMIN_PASSWORD (12 caracteres o más) y, opcionalmente, ADMIN_NAME");
  }

  const password = await bcrypt.hash(entrada.data.password, 12);
  await conPrismaTenant(entrada.data.tenantId, async (prisma) => {
    const administradores = await prisma.user.count({ where: { role: "ADMIN" } });
    if (administradores > 0) throw new Error("Ya existe un administrador");

    const existente = await prisma.user.findUnique({ where: { email: entrada.data.email } });
    if (existente) throw new Error("El correo ya pertenece a otro usuario");

    await prisma.user.create({
      data: {
        email: entrada.data.email,
        name: entrada.data.name,
        password,
        role: "ADMIN",
      },
    });
    console.log(`Administrador creado: ${entrada.data.email}`);
  });
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
