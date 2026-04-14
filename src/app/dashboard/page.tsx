import { getGarments, getCategories, getProviders } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import Search from "@/components/Search";
import CategoryFilter from "@/components/garment/CategoryFilter";
import ProductModal from "@/components/garment/productModal";
import CategoryModal from "@/components/garment/CategoryModal";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const category = params?.category || "";

  const [garments, sizeTypes, categories, providers] = await Promise.all([
    getGarments(query, category),
    getSizeTypes(),
    getCategories(),
    getProviders(),
  ]);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase italic text-white">Gestión de Inventario</h1>
          <p className="text-neutral-500 text-sm font-light uppercase tracking-widest">Control de Stock y Rentabilidad</p>
        </div>
        
        <div className="flex flex-row flex-wrap gap-4">
          <CategoryModal sizeTypes={sizeTypes} /> 
          <ProductModal categories={categories} sizes={sizeTypes} providers={providers} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1"><Search className="w-full" /></div>
        <div className="w-full md:w-64"><CategoryFilter categories={categories} /></div>
      </div>

      <div className="overflow-x-auto border border-neutral-800 rounded-2xl bg-neutral-900/30 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
              <th className="px-6 py-5 font-black">SKU Ref.</th>
              <th className="px-6 py-5 font-black">Producto</th>
              <th className="px-6 py-5 font-black">Categoría</th>
              <th className="px-6 py-5 font-black">Proveedor</th>
              <th className="px-6 py-5 font-black">Finanzas</th>
              <th className="px-6 py-5 font-black text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {garments.map((item: any) => (
              <tr key={item.id} className="hover:bg-amber-500/[0.02] transition-colors group text-sm">
                <td className="px-6 py-4 font-mono text-[10px] text-amber-500/50">
                  {item.variants?.[0]?.sku || "---"}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white uppercase tracking-tighter italic">{item.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-400 text-[9px] font-black uppercase">
                    {item.category?.name}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  {item.supplier ? (
                    <Link 
                      href={`provider?id=${item.supplier.id}`}
                      className="text-amber-500/60 hover:text-amber-500 hover:underline transition-all text-[11px] font-bold uppercase"
                    >
                      {item.supplier.name}
                    </Link>
                  ) : (
                    <span className="text-neutral-700 text-[10px] uppercase font-bold">Sin Prov.</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="text-emerald-500 font-mono font-bold">${Number(item.price).toLocaleString()}</div>
                </td>
                
                <td className="px-6 py-4 text-right">
                  <ProductModal garment={item} categories={categories} sizes={sizeTypes} providers={providers} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}