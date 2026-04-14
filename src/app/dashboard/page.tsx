import { getGarments, getCategories, getProviders } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import Search from "@/components/Search";
import CategoryFilter from "@/components/garment/CategoryFilter";
import ProductModal from "@/components/garment/productModal";
import CategoryModal from "@/components/garment/CategoryModal";
import MovementModal from "@/components/garment/MovementModal";
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
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
            <span className="w-2 h-8 bg-amber-500 rounded-full inline-block" />
            Gestión de Inventario
          </h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 ml-5">
            Control de Stock y Operaciones
          </p>
        </div>
        
        <div className="flex flex-row flex-wrap gap-3">
          <MovementModal garments={garments} /> 
          <CategoryModal sizeTypes={sizeTypes} /> 
          <ProductModal 
            categories={categories} 
            sizes={sizeTypes} 
            providers={providers} 
          />
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Search className="w-full" />
        </div>
        <div className="w-full md:w-72">
          <CategoryFilter categories={categories} />
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="overflow-x-auto border border-neutral-900 rounded-[2.5rem] bg-black/40 backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-600 text-[9px] uppercase tracking-[0.3em] font-black">
              <th className="px-8 py-6">Ref. SKU</th>
              <th className="px-8 py-6 text-white">Producto</th>
              <th className="px-8 py-6">Categoría</th>
              <th className="px-8 py-6">Talles</th>
              <th className="px-8 py-6 text-amber-500/80">Proveedor</th>
              <th className="px-8 py-6 text-right">Stock Total</th>
              <th className="px-8 py-6 text-right">Costo</th>
              <th className="px-8 py-6 text-right">Venta</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/50">
            {garments.map((item: any) => {
              const totalStock = item.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;

              return (
                <tr key={item.id} className="hover:bg-amber-500/[0.01] transition-all group text-sm">
                  
                  {/* SKU */}
                  <td className="px-8 py-5 font-mono text-[10px] text-neutral-600">
                    {item.variants?.[0]?.sku || "---"}
                  </td>

                  {/* NOMBRE PRODUCTO */}
                  <td className="px-8 py-5">
                    <div className="font-bold text-white uppercase tracking-tighter italic text-base leading-none">
                      {item.name}
                    </div>
                  </td>

                  {/* CATEGORÍA */}
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 text-[9px] font-black uppercase tracking-widest">
                      {item.category?.name || "Gral"}
                    </span>
                  </td>

                  {/* COLUMNA DE TALLES */}
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {item.variants?.map((v: any) => (
                        <span 
                          key={v.id} 
                          className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 text-[9px] font-black uppercase"
                        >
                          {v.size?.value || "S/T"}
                        </span>
                      ))}
                    </div>
                  </td>
                  
                  {/* PROVEEDOR */}
                  <td className="px-8 py-5">
                    {item.supplier ? (
                      <Link 
                        href={`/dashboard/providers?id=${item.supplier.id}`}
                        className="text-amber-500/40 hover:text-amber-500 hover:underline transition-all text-[11px] font-black uppercase italic tracking-tight"
                      >
                        {item.supplier.name}
                      </Link>
                    ) : (
                      <span className="text-neutral-800 text-[10px] uppercase font-bold italic tracking-tighter">Sin Asignar</span>
                    )}
                  </td>

                  {/* STOCK TOTAL */}
                  <td className="px-8 py-5 text-right font-mono font-bold">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm ${totalStock <= 0 ? 'text-red-500' : totalStock <= 5 ? 'text-amber-500' : 'text-white'}`}>
                        {totalStock}
                      </span>
                      <span className="text-[7px] text-neutral-600 uppercase tracking-widest font-black">Unidades</span>
                    </div>
                  </td>

                  {/* PRECIO COSTO */}
                  <td className="px-8 py-5 text-right font-mono font-bold text-neutral-500">
                    <span className="text-[10px] mr-1 opacity-50 font-sans italic">$</span>
                    {Number(item.cost || 0).toLocaleString('es-AR')}
                  </td>

                  {/* PRECIO VENTA */}
                  <td className="px-8 py-5 text-right font-mono font-bold text-emerald-500">
                    <span className="text-[10px] mr-1 opacity-50 font-sans italic">$</span>
                    {Number(item.price).toLocaleString('es-AR')}
                  </td>
                  
                  {/* ACCIONES */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                      <ProductModal 
                        garment={item} 
                        categories={categories} 
                        sizes={sizeTypes} 
                        providers={providers} 
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {garments.length === 0 && (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <p className="text-neutral-700 uppercase text-[10px] font-black tracking-[0.5em]">
                    No se encontraron productos en el sistema
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}