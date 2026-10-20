import { redirect } from "next/navigation";
import PerfilCliente from "@/components/perfil/perfil-cliente";
import { conPrisma } from "@/lib/prisma";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";

export default async function PaginaPerfil() {
  let usuarioId: string;
  try { usuarioId = (await requiereUsuarioTenant()).usuarioId; }
  catch { redirect("/login?callbackUrl=%2Fperfil"); }
  const usuario = await conPrisma((prisma) => prisma.user.findUnique({
    where: { id: usuarioId },
    select: {
      name: true,
      email: true,
      telefono: true,
      password: true,
      account: { where: { provider: "google" }, select: { id: true }, take: 1 },
      direcciones: { orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }] },
    },
  }));
  if (!usuario) redirect("/login?callbackUrl=%2Fperfil");
  return <PerfilCliente nombre={usuario.name} telefono={usuario.telefono} email={usuario.email} direcciones={usuario.direcciones} puedeVincularGoogle={usuario.password !== null && usuario.account.length === 0} />;
}
