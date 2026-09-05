"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import ProductModal from "@/components/providers/products/modals/ProductModal";
import ProductsActiveFilters from "./products-active-filters";
import ProductsEmptyState from "./products-empty-state";
import ProductsFilters from "./products-filters";
import ProductsHeader from "./products-header";
import ProductsPagination from "./products-pagination";
import ProductsSearch from "./products-search";
import ProductsSort from "./products-sort";
import ProductsTable from "./products-table";
import ProductsTableSkeleton from "./products-table-skeleton";
import ProductsToolbar from "./products-toolbar";
import { useCategories } from "@/hooks/useCategories";
import { useColors } from "@/hooks/useColors";
import { useFiltrosProductos } from "@/hooks/use-filtros-productos";
import { useProductosAdmin } from "@/hooks/use-productos-admin";
import { useProviders } from "@/hooks/useProviders";
import { useSizeTypes } from "@/hooks/useSizeTypes";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";
import { deleteGarment } from "@/actions/garments";
import { actualizarVisibilidadProducto } from "@/actions/productos";
import { LIMITE_DEFECTO } from "@/lib/productos/query-params";
import type { ProductoAdminRow } from "@/lib/productos/tipos";
import type {
  ProductoAdministracion,
  CategoriaAdministracion,
  ProveedorAdministracion,
} from "@/types/productos/administracion-productos";

function adaptarProducto(producto: ProductoAdminRow): ProductoAdministracion {
  return {
    id: producto.id,
    name: producto.nombre,
    price: producto.precio,
    maxPrice: producto.precioMaximo,
    categoryId: producto.categoria?.id,
    subCategoryId: producto.subcategoria?.id,
    supplierId: producto.proveedor?.id,
    category: producto.categoria ? { name: producto.categoria.nombre } : null,
  };
}

export default function ProductsPage() {
  const paleta = useAdminPaleta();
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  const { filtros, actualizar, limpiar } = useFiltrosProductos();
  const { data, isPending, isError } = useProductosAdmin(filtros);
  const { data: categorias } = useCategories();
  const { data: proveedores } = useProviders();
  const { data: talles } = useSizeTypes();
  const { data: colores } = useColors();

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [edicion, setEdicion] = useState<ProductoAdminRow | null>(null);
  const [eliminar, setEliminar] = useState<ProductoAdminRow | null>(null);

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "productos-admin"] });

  const filas = data?.filas ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;

  const hayFiltros = Boolean(
    filtros.busqueda ||
      filtros.categoriaId ||
      filtros.subcategoriaId ||
      filtros.proveedorId ||
      filtros.estado ||
      filtros.stock
  );

  const abrirCrear = () => {
    setEdicion(null);
    setCrearAbierto(true);
  };

  const abrirEdicion = (producto: ProductoAdminRow) => {
    setCrearAbierto(false);
    setEdicion(producto);
  };

  const cerrarModal = () => {
    setCrearAbierto(false);
    setEdicion(null);
  };

  const confirmarEliminar = async () => {
    if (!eliminar) return;
    const resultado = await deleteGarment(eliminar.id);
    if (resultado.error) toast.error(resultado.error);
    else toast.success("Producto eliminado correctamente");
    setEliminar(null);
    invalidar();
  };

  const manejarVisibilidad = async (producto: ProductoAdminRow) => {
    const resultado = await actualizarVisibilidadProducto(producto.id, !producto.activo);
    if (resultado.error) {
      toast.error(resultado.error);
    } else {
      toast.success(producto.activo ? "Producto ocultado" : "Producto activado");
      invalidar();
    }
  };

  const categoriasSeguras: CategoriaAdministracion[] = categorias ?? [];
  const proveedoresSeguros: ProveedorAdministracion[] = proveedores ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
      <ProductsHeader onAgregar={abrirCrear} />

      <div className="mt-6 space-y-4">
        <ProductsToolbar>
          <div className="flex flex-col gap-3">
            <ProductsSearch
              valor={filtros.busqueda}
              alCambiar={(valor) => actualizar({ busqueda: valor, pagina: 1 })}
            />
            <div className="flex flex-wrap items-center gap-2">
              <ProductsFilters
                categorias={categoriasSeguras}
                proveedores={proveedoresSeguros}
                filtros={filtros}
                actualizar={actualizar}
              />
              <div className="ml-auto">
                <ProductsSort
                  valor={filtros.orden}
                  alCambiar={(orden) => actualizar({ orden, pagina: 1 })}
                />
              </div>
            </div>
          </div>
        </ProductsToolbar>

        <ProductsActiveFilters
          filtros={filtros}
          categorias={categoriasSeguras}
          proveedores={proveedoresSeguros}
          actualizar={actualizar}
          limpiar={limpiar}
        />

        {isPending ? (
          <ProductsTableSkeleton filas={6} />
        ) : isError ? (
          <div
            className="rounded-xl border py-16 text-center text-sm"
            style={{ borderColor: paleta.borde, color: paleta.textoSuave }}
          >
            No se pudieron cargar los productos.
          </div>
        ) : filas.length === 0 ? (
          <ProductsEmptyState
            conFiltros={hayFiltros}
            onAgregar={abrirCrear}
            onLimpiar={limpiar}
          />
        ) : (
          <ProductsTable
            productos={filas}
            onEditar={abrirEdicion}
            onCambiarVisibilidad={manejarVisibilidad}
            onEliminar={setEliminar}
            onNavegar={abrirEdicion}
          />
        )}
      </div>

      {!isPending && filas.length > 0 && (
        <div className="mt-4">
          <ProductsPagination
            pagina={filtros.pagina}
            totalPaginas={totalPaginas}
            total={total}
            limite={LIMITE_DEFECTO}
            alCambiarPagina={(pagina) => actualizar({ pagina })}
          />
        </div>
      )}

      {(crearAbierto || edicion) && (
        <ProductModal
          categories={categoriasSeguras}
          sizes={talles ?? []}
          providers={proveedoresSeguros}
          colors={colores ?? []}
          open={true}
          onClose={cerrarModal}
          onSuccess={invalidar}
          garment={edicion ? adaptarProducto(edicion) : undefined}
        />
      )}

      {eliminar && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Estás seguro de eliminar "${eliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmarEliminar}
          onCancel={() => setEliminar(null)}
        />
      )}
    </div>
  );
}
