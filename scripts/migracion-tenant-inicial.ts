import "dotenv/config";
import { clientePrisma } from "./multitenencia/cliente-prisma";
import { ejecutarMigracionTenantInicial } from "./multitenencia/ejecutar-migracion-tenant-inicial";

export async function main(): Promise<void> {
  await ejecutarMigracionTenantInicial(clientePrisma);
}

main()
  .catch((error: unknown) => {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`FATAL: ${mensaje}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await clientePrisma.$disconnect();
  });
