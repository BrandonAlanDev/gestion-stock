import { getProviders } from "@/actions/proveedores/obtener-proveedores";
import PaginaProveedoresCliente from "@/components/admin/proveedores/PaginaProveedoresCliente";

export default async function PaginaProveedores() {
  const proveedores = await getProviders();
  return <PaginaProveedoresCliente proveedoresIniciales={proveedores} />;
}
