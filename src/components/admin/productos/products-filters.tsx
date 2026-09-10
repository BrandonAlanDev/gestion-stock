"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { CLASE_BOTON_OUTLINE, CLASE_SELECT, colorOpcion } from "@/lib/productos/estilos";
import type { FiltrosProductos } from "@/lib/productos/query-params";
import type {
  CategoriaAdministracion,
  ProveedorAdministracion,
} from "@/types/productos/administracion-productos";

interface ProductsFiltersProps {
  categorias: CategoriaAdministracion[];
  proveedores: ProveedorAdministracion[];
  filtros: FiltrosProductos;
  actualizar: (parcial: Partial<FiltrosProductos>) => void;
}

export default function ProductsFilters({
  categorias,
  proveedores,
  filtros,
  actualizar,
}: ProductsFiltersProps) {
  const [masAbierto, setMasAbierto] = useState(false);

  const categoriaSeleccionada = categorias.find((c) => c.id === filtros.categoriaId);
  const subcategorias = categoriaSeleccionada?.subCategories ?? [];

  return (
    <>
      <div className="relative">
        <select
          aria-label="Filtrar por categoría"
          value={filtros.categoriaId}
          onChange={(e) =>
            actualizar({ categoriaId: e.target.value, subcategoriaId: "", pagina: 1 })
          }
          className={CLASE_SELECT}
        >
          <option value="" style={colorOpcion()}>
            Todas las categorías
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id} style={colorOpcion()}>
              {categoria.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
        />
      </div>

      <div className="relative">
        <select
          aria-label="Filtrar por subcategoría"
          disabled={!filtros.categoriaId}
          value={filtros.subcategoriaId}
          onChange={(e) => actualizar({ subcategoriaId: e.target.value, pagina: 1 })}
          className={CLASE_SELECT}
        >
          <option value="" style={colorOpcion()}>
            Todas las subcategorías
          </option>
          {subcategorias.map((subcategoria) => (
            <option key={subcategoria.id} value={subcategoria.id} style={colorOpcion()}>
              {subcategoria.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
        />
      </div>

      <div className="relative">
        <select
          aria-label="Filtrar por stock"
          value={filtros.stock}
          onChange={(e) =>
            actualizar({ stock: e.target.value as FiltrosProductos["stock"], pagina: 1 })
          }
          className={CLASE_SELECT}
        >
          <option value="" style={colorOpcion()}>
            Todo el stock
          </option>
          <option value="en-stock" style={colorOpcion()}>
            Con stock
          </option>
          <option value="bajo-stock" style={colorOpcion()}>
            Stock bajo
          </option>
          <option value="sin-stock" style={colorOpcion()}>
            Sin stock
          </option>
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
        />
      </div>

      <button
        type="button"
        onClick={() => setMasAbierto((abierto) => !abierto)}
        className={CLASE_BOTON_OUTLINE}
      >
        <SlidersHorizontal size={15} />
        Más filtros
      </button>

      {masAbierto && (
        <div className="flex w-full flex-wrap items-center gap-2 border-t border-[var(--admin-borde)] pt-3">
          <div className="relative">
            <select
              aria-label="Filtrar por proveedor"
              value={filtros.proveedorId}
              onChange={(e) => actualizar({ proveedorId: e.target.value, pagina: 1 })}
              className={CLASE_SELECT}
            >
              <option value="" style={colorOpcion()}>
                Todos los proveedores
              </option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id} style={colorOpcion()}>
                  {proveedor.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrar por estado"
              value={filtros.estado}
              onChange={(e) =>
                actualizar({ estado: e.target.value as FiltrosProductos["estado"], pagina: 1 })
              }
              className={CLASE_SELECT}
            >
              <option value="" style={colorOpcion()}>
                Todos los estados
              </option>
              <option value="activo" style={colorOpcion()}>
                Activo
              </option>
              <option value="oculto" style={colorOpcion()}>
                Oculto
              </option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
            />
          </div>
        </div>
      )}
    </>
  );
}
