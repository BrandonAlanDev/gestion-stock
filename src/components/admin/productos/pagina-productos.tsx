"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import FormularioProducto from "@/components/admin/productos/formulario/FormularioProducto";
import FiltrosActivosProductos from "./filtros-activos-productos";
import EstadoVacioProductos from "./estado-vacio-productos";
import FiltrosProductos from "./filtros-productos";
import EncabezadoProductos from "./encabezado-productos";
import PaginacionProductos from "./paginacion-productos";
import BusquedaProductos from "./busqueda-productos";
import OrdenamientoProductos from "./ordenamiento-productos";
import TablaProductos from "./tabla-productos";
import EsqueletoTablaProductos from "./esqueleto-tabla-productos";
import BarraHerramientasProductos from "./barra-herramientas-productos";
import { useCategories } from "@/hooks/useCategories";
import { useFiltrosProductos } from "@/hooks/productos/use-filtros-productos";
import { useProductosAdmin } from "@/hooks/productos/use-productos-admin";
import { useProviders } from "@/hooks/useProviders";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";
import { eliminarPrenda } from "@/actions/prendas/eliminar-prenda";
import { actualizarVisibilidadProducto } from "@/actions/productos/actualizar-visibilidad-producto";
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

export default function PaginaProductos() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  const { filtros, actualizar, limpiar } = useFiltrosProductos();
  const { data, isPending, isError } = useProductosAdmin(filtros);
  const { data: categorias } = useCategories();
  const { data: proveedores } = useProviders();

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
    const resultado = await eliminarPrenda(eliminar.id);
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
    <div className="p-4 text-[var(--admin-texto)] sm:p-6 lg:p-8">
      <EncabezadoProductos onAgregar={abrirCrear} />

      <div className="mt-6 space-y-4">
        <BarraHerramientasProductos>
          <div className="flex flex-col gap-3">
            <BusquedaProductos
              valor={filtros.busqueda}
              alCambiar={(valor) => actualizar({ busqueda: valor, pagina: 1 })}
            />
            <div className="flex flex-wrap items-center gap-2">
              <FiltrosProductos
                categorias={categoriasSeguras}
                proveedores={proveedoresSeguros}
                filtros={filtros}
                actualizar={actualizar}
              />
              <div className="ml-auto">
                <OrdenamientoProductos
                  valor={filtros.orden}
                  alCambiar={(orden) => actualizar({ orden, pagina: 1 })}
                />
              </div>
            </div>
          </div>
        </BarraHerramientasProductos>

        <FiltrosActivosProductos
          filtros={filtros}
          categorias={categoriasSeguras}
          proveedores={proveedoresSeguros}
          actualizar={actualizar}
          limpiar={limpiar}
        />

        {isPending ? (
          <EsqueletoTablaProductos filas={6} />
        ) : isError ? (
          <div
            className="rounded-xl border border-[var(--admin-borde)] py-16 text-center text-sm text-[var(--admin-texto-suave)]"
          >
            No se pudieron cargar los productos.
          </div>
        ) : filas.length === 0 ? (
          <EstadoVacioProductos
            conFiltros={hayFiltros}
            onAgregar={abrirCrear}
            onLimpiar={limpiar}
          />
        ) : (
          <TablaProductos
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
          <PaginacionProductos
            pagina={filtros.pagina}
            totalPaginas={totalPaginas}
            total={total}
            limite={LIMITE_DEFECTO}
            alCambiarPagina={(pagina) => actualizar({ pagina })}
          />
        </div>
      )}

      {(crearAbierto || edicion) && (
        <FormularioProducto
          categorias={categoriasSeguras}
          open={true}
          onClose={cerrarModal}
          onSuccess={invalidar}
          productoSemilla={edicion ? adaptarProducto(edicion) : undefined}
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
