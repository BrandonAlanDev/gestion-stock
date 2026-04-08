import { getGarments, getSizes, getCategories } from "@/actions/garments";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductModal from "@/components/garment/productModal"; // Ajusta la ruta a tu componente

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";

  // Traemos todos los datos necesarios en paralelo para optimizar la carga
  const [garments, sizes, categories] = await Promise.all([
    getGarments(query),
    getSizes(),
    getCategories(),
  ]);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 pt-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Inventario</h1>
          <p className="text-neutral-500 text-sm">Control de stock por talles y variantes</p>
        </div>
        <div className="flex flex-row gap-4">
          <Link href="/dashboard/categories">
            <Button variant={"blanco"} className="px-4 py-2 rounded-lg text-sm font-medium">
              Categorías
            </Button>
          </Link>
          
          {/* Nuevo Modal Adaptado */}
          <ProductModal categories={categories} sizes={sizes} />
        </div>
      </div>

      <div className="mb-6">
        <Search />
      </div>

      <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-neutral-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 text-sm uppercase">
              <th className="px-6 py-4 font-medium">SKU (Ref)</th>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 font-medium">Stock Total</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {garments.map((item: any) => {
              // Calculamos el stock total sumando todas sus variantes
              const totalStock = item.variants?.reduce(
                (acc: number, v: any) => acc + v.stock,
                0
              ) || 0;

              return (
                <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-blue-400">
                    {item.variants?.[0]?.sku || "SIN SKU"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-neutral-500 truncate max-w-[200px]">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs">
                      {item.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-green-400 font-semibold">
                    ${Number(item.price).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-bold ${totalStock < 5 ? 'text-red-400' : 'text-neutral-100'}`}>
                      {totalStock} <span className="text-[10px] font-normal text-neutral-500">U.</span>
                    </div>
                    {/* Desglose de talles */}
                    <div className="flex gap-1 mt-1">
                      {item.variants?.map((v: any) => (
                        <span 
                          key={v.id} 
                          title={`Talle ${v.size.code}`}
                          className="text-[9px] px-1 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded"
                        >
                          {v.size.code}:{v.stock}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-neutral-400 hover:text-white text-sm transition-colors">
                      Editar
                    </button>
                    <button className="text-neutral-400 hover:text-red-400 text-sm transition-colors">
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {garments.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-neutral-500">No se encontraron productos.</p>
            <p className="text-neutral-600 text-sm">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}