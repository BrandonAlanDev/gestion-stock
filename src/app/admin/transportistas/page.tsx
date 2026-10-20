import FormularioTransportista from "@/components/admin/transportistas/formulario-transportista";
import { conPrisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export default async function PaginaTransportistas() {
  await requiereAdmin();
  const transportistas = await conPrisma((prisma) => prisma.transportista.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }] }));
  return <div className="mx-auto max-w-5xl space-y-5 px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8"><div><h1 className="text-2xl font-bold">Transportistas</h1><p className="mt-1 text-sm text-[var(--admin-texto-suave)]">Configurá las empresas y sus enlaces de seguimiento.</p></div><FormularioTransportista />{transportistas.map((transportista) => <FormularioTransportista key={transportista.id} inicial={{ id: transportista.id, nombre: transportista.nombre, plantillaUrl: transportista.plantillaUrl, requiereUrl: transportista.requiereUrl, activo: transportista.activo }} />)}</div>;
}
