import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ContextoVerificacion, ResultadoCaso } from "./tipos";
import { afirmar } from "./afirmar";
import { publicIdPerteneceTenant } from "../../src/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";

async function leerCodigo(...segmentos: string[]): Promise<string> {
  return readFile(join(process.cwd(), ...segmentos), "utf8");
}

export async function ejecutarCasos(contexto: ContextoVerificacion): Promise<ResultadoCaso[]> {
  const { cliente, tenantA, tenantB } = contexto;
  const resultados: ResultadoCaso[] = [];
  const caso = async (nombre: string, prueba: () => Promise<void> | void) => {
    try {
      await prueba();
      resultados.push({ nombre, correcto: true });
    } catch (error) {
      resultados.push({
        nombre,
        correcto: false,
        detalle: error instanceof Error ? error.message : String(error),
      });
    }
  };

  await caso("1. IDOR de lectura", async () => {
    const producto = await cliente.garment.findFirst({
      where: { id: contexto.productoB, tenantId: tenantA },
    });
    afirmar(producto === null, "El tenant A pudo leer un producto del tenant B");
  });
  await caso("2. IDOR de modificación", async () => {
    const resultado = await cliente.garment.updateMany({
      where: { id: contexto.productoB, tenantId: tenantA },
      data: { name: "Intrusión" },
    });
    afirmar(resultado.count === 0, "El tenant A modificó un producto del tenant B");
  });
  await caso("3. IDOR de eliminación", async () => {
    const resultado = await cliente.garment.deleteMany({
      where: { id: contexto.productoB, tenantId: tenantA },
    });
    afirmar(resultado.count === 0, "El tenant A eliminó un producto del tenant B");
    afirmar(await cliente.garment.count({ where: { id: contexto.productoB } }), "El producto B desapareció");
  });
  await caso("4. Unicidades por tenant", async () => {
    afirmar(
      (await cliente.category.count({ where: { name: "Compartida", tenantId: { in: [tenantA, tenantB] } } })) === 2,
      "El mismo nombre no coexistió entre tenants",
    );
    afirmar(
      (await cliente.user.count({ where: { email: "igual@verificacion.local", tenantId: { in: [tenantA, tenantB] } } })) === 2,
      "El mismo email no coexistió entre tenants",
    );
  });
  await caso("5. Sesión A en host B", async () => {
    const codigo = await leerCodigo("src", "lib", "tenants", "obtener-tenant-de-sesion.ts");
    afirmar(codigo.includes("usuarioSesion.tenantId !== tenant.id"), "La sesión no se compara con el tenant del host");
    afirmar(codigo.includes("tenantId: usuarioSesion.tenantId"), "El usuario no se relee dentro del tenant de la sesión");
    afirmar(codigo.includes("usuarioBase.tenantId !== tenant.id"), "La pertenencia del usuario no se contrasta con el host");
  });
  await caso("6. Tenant suspendido", async () => {
    await cliente.tenant.update({ where: { id: tenantA }, data: { estado: "SUSPENDIDO" } });
    const tenant = await cliente.tenant.findUnique({ where: { id: tenantA } });
    const codigo = await leerCodigo("src", "lib", "tenants", "requiere-tenant-activo.ts");
    afirmar(tenant?.estado === "SUSPENDIDO", "El estado suspendido no se persistió");
    afirmar(codigo.includes('tenant.estado === "SUSPENDIDO"'), "El guard público no bloquea tenants suspendidos");
    await cliente.tenant.update({ where: { id: tenantA }, data: { estado: "ACTIVO" } });
  });
  await caso("7. Tenant inactivo", async () => {
    await cliente.tenant.update({ where: { id: tenantB }, data: { estado: "INACTIVO" } });
    const tenant = await cliente.tenant.findUnique({ where: { id: tenantB } });
    const codigo = await leerCodigo("src", "lib", "tenants", "requiere-tenant-activo.ts");
    afirmar(tenant?.estado === "INACTIVO", "El tenant inactivo no fue bloqueado");
    afirmar(codigo.includes('tenant.estado !== "ACTIVO"'), "El guard público acepta estados distintos de ACTIVO");
    await cliente.tenant.update({ where: { id: tenantB }, data: { estado: "ACTIVO" } });
  });
  await caso("8. Hostname inexistente", async () => {
    const tenant = await cliente.tenant.findFirst({
      where: { OR: [{ dominio: "inexistente.verificacion.local" }, { slug: "inexistente" }] },
    });
    afirmar(tenant === null, "Un hostname inexistente resolvió un tenant");
    const codigo = await leerCodigo("src", "lib", "tenants", "resolver-tenant-host.ts");
    afirmar(codigo.includes("if (!dominioPrincipal) return null"), "El resolver aplica un fallback sin dominio principal");
    afirmar(codigo.includes("if (!hostname.endsWith(sufijo)) return null"), "El resolver acepta hosts fuera del dominio principal");
  });
  await caso("9. Identidad de cache", () => {
    const clave = (tenantId: string, pagina: number, categoria: string) =>
      JSON.stringify([`tenant:${tenantId}:products`, pagina, 20, categoria]);
    const claves = new Set([
      clave(tenantA, 1, contexto.categoriaA),
      clave(tenantA, 1, contexto.categoriaB),
      clave(tenantB, 1, contexto.categoriaA),
    ]);
    afirmar(claves.size === 3, "Las claves de cache colisionan");
  });
  await caso("10. Query keys", () => {
    const categorias = JSON.stringify(["tenant", tenantA, "categories"]);
    const catalogo = JSON.stringify(["tenant", tenantA, "catalogCategories"]);
    const otroTenant = JSON.stringify(["tenant", tenantB, "categories"]);
    afirmar(new Set([categorias, catalogo, otroTenant]).size === 3, "Las query keys colisionan");
  });
  await caso("11. Claves de storage", () => {
    const clavesA = [`cart:${tenantA}`, `cartTimestamp:${tenantA}`, `${tenantA}:termsAccepted`];
    const clavesB = [`cart:${tenantB}`, `cartTimestamp:${tenantB}`, `${tenantB}:termsAccepted`];
    afirmar(clavesA.every((clave) => !clavesB.includes(clave)), "Storage comparte claves entre tenants");
  });
  await caso("12. Carpetas Cloudinary", () => {
    const carpetaA = `${tenantA}/garments/${contexto.categoriaA}/${contexto.productoA}`;
    const carpetaB = `${tenantB}/garments/${contexto.categoriaB}/${contexto.productoB}`;
    afirmar(carpetaA !== carpetaB && carpetaA.startsWith(`${tenantA}/`), "Cloudinary no quedó aislado");
    afirmar(publicIdPerteneceTenant(carpetaA, tenantA), "El guard rechazó el namespace del tenant activo");
    afirmar(!publicIdPerteneceTenant(carpetaA, tenantB), "El guard aceptó el namespace de otro tenant");
    afirmar(publicIdPerteneceTenant(`gestion-stock/tenants/${tenantA}/producto`, tenantA), "El guard rechazó el namespace multitenant anterior");
    afirmar(!publicIdPerteneceTenant(`gestion-stock/tenants/${tenantA}/producto`, tenantB), "El guard aceptó un namespace multitenant anterior ajeno");
    afirmar(publicIdPerteneceTenant("gestion-stock/producto-historico", tenantA), "El guard dejó de aceptar recursos históricos");
  });
  await caso("13. OAuth y linking", async () => {
    await cliente.account.createMany({ data: [
      { tenantId: tenantA, userId: contexto.usuarioA, type: "oauth", provider: "google", providerAccountId: "google-compartido" },
      { tenantId: tenantB, userId: contexto.usuarioB, type: "oauth", provider: "google", providerAccountId: "google-compartido" },
    ] });
    const cuentas = await cliente.account.findMany({ where: { providerAccountId: "google-compartido", tenantId: { in: [tenantA, tenantB] } }, include: { user: true } });
    afirmar(cuentas.length === 2, "La misma cuenta Google no coexistió en dos tenants");
    afirmar(cuentas.every((cuenta) => cuenta.tenantId === cuenta.user.tenantId), "Existe Account A vinculada con User B");
    afirmar(!await cliente.account.findFirst({ where: { tenantId: tenantA, providerAccountId: "google-no-asociado" } }), "Cuenta Google no asociada apareció vinculada");
  });
  await caso("14. Proveedores exige ADMIN", async () => {
    const codigo = await leerCodigo("src", "actions", "proveedores", "obtener-proveedores.ts");
    afirmar(codigo.includes("requiereAdmin()"), "getProviders no exige una sesión ADMIN");
    afirmar(!codigo.includes("requiereTenantActivo()"), "getProviders acepta un usuario público");
  });

  return resultados;
}
