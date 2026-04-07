import { getGarments } from "@/actions/garments";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const garments = await getGarments(query);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 pt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Stock</h1>
        <div className="flex flex-row gap-4">
          <Link href="/dashboard/categories" >
            <Button variant={"blanco"} className="px-4 py-2 rounded-lg text-sm font-medium">
              Categorias
            </Button>
          </Link>
          <Button variant={"amarillo"} className="px-4 py-2 rounded-lg text-sm font-medium">
            + Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Search />
      </div>

      <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-neutral-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 text-sm uppercase">
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {garments.map((item: any) => (
              <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-blue-400">{item.sku}</td>
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4 text-neutral-400">{item.category.name}</td>
                <td className="px-6 py-4 text-green-400 font-semibold">${Number(item.price).toFixed(2)}</td>
                <td className={`px-6 py-4 ${item.stock < 5 ? 'text-red-400' : ''}`}>
                  {item.stock} unidades
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-neutral-400 hover:text-white">Editar</button>
                  <button className="text-neutral-400 hover:text-red-400">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {garments.length === 0 && (
          <div className="p-10 text-center text-neutral-500">
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}