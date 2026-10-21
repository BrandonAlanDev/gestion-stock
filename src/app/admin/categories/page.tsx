import { getCategories } from "@/actions/categorias/obtener-categorias";
import { getSizeTypes } from "@/actions/talles/obtener-tipos-talle";
import PaginaCategoriasCliente from "@/components/admin/categorias/PaginaCategoriasCliente";

export default async function PaginaCategorias() {
  const [categorias, tiposTalle] = await Promise.all([getCategories(), getSizeTypes()]);
  return <PaginaCategoriasCliente categoriasIniciales={categorias} tiposTalleIniciales={tiposTalle} />;
}
