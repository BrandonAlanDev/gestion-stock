import { getSizeTypes } from "@/actions/talles/obtener-tipos-talle";
import PaginaTallesCliente from "@/components/admin/talles/PaginaTallesCliente";

export default async function PaginaTalles() {
  const tiposTalle = await getSizeTypes();
  return <PaginaTallesCliente tiposTalleIniciales={tiposTalle} />;
}
