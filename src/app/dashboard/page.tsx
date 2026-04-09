import { getGarments, getSizes, getCategories, getProviders } from "@/actions/garments";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
import ProductModal from "@/components/garment/productModal";
import CategoryModal from "@/components/garment/CategoryModal";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";

  const [garments, sizes, categories, providers] = await Promise.all([
    getGarments(query),
    getSizes(),
    getCategories(),
    getProviders(),
  ]);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 pt-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase italic">Gestión de Inventario</h1>
          <p className="text-neutral-500 text-sm font-light">Control de stock y variantes</p>
        </div>
        
        {/* MODALES AQUÍ: Solo una vez, en la cabecera */}
        <div className="flex flex-row gap-4">
          <CategoryModal /> 
          <ProductModal 
            categories={categories} 
            sizes={sizes} 
            providers={providers} 
          />
        </div>
      </div>

      <div className="mb-6">
        <Search />
      </div>

      <div className="overflow-x-auto border border-neutral-800 rounded-2xl bg-neutral-900/30 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
              <th className="px-6 py-5 font-black">SKU Principal</th>
              <th className="px-6 py-5 font-black">Producto</th>
              <th className="px-6 py-5 font-black">Categoría</th>
              <th className="px-6 py-5 font-black">Precio Unit.</th>
              <th className="px-6 py-5 font-black">Stock Total</th>
              <th className="px-6 py-5 font-black text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {garments.map((item: any) => {
              const totalStock = item.variants?.reduce(
                (acc: number, v: any) => acc + v.stock,
                0
              ) || 0;

              return (
                <tr key={item.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-amber-500/50">
                    {item.variants?.[0]?.sku || "---"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white group-hover:text-amber-500 transition-colors uppercase tracking-tighter">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-400 text-[9px] font-bold uppercase">
                      {item.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-500 font-mono text-sm">
                    ${Number(item.price).toLocaleString("es-AR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-black text-lg ${totalStock < 5 ? 'text-red-500' : 'text-neutral-100'}`}>
                      {totalStock} <span className="text-[10px] font-normal text-neutral-500">U.</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.variants?.map((v: any) => (
                        <span 
                          key={v.id} 
                          className="text-[9px] px-1.5 py-0.5 bg-black border border-neutral-800 text-neutral-500 rounded font-mono"
                        >
                          {v.size.value}:<span className={v.stock > 0 ? "text-amber-500" : "text-red-900"}>{v.stock}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-xs text-neutral-600 hover:text-white transition-all">Editar</button>
                      <button className="text-xs text-neutral-600 hover:text-red-500 transition-all">Borrar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}