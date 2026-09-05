"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";
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
  const paleta = useAdminPaleta();
  const [masAbierto, setMasAbierto] = useState(false);

  const categoriaSeleccionada = categorias.find((c) => c.id === filtros.categoriaId);
  const subcategorias = categoriaSeleccionada?.subCategories ?? [];

  const estiloSelect: React.CSSProperties = {
    backgroundColor: paleta.fondo,
    border: `1px solid ${paleta.borde}`,
    color: paleta.texto,
  };

  const claseSelect =
    "appearance-none cursor-pointer rounded-xl py-2 pl-3 pr-8 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <>
      <div className="relative">
        <select
          aria-label="Filtrar por categoría"
          value={filtros.categoriaId}
          onChange={(e) =>
            actualizar({ categoriaId: e.target.value, subcategoriaId: "", pagina: 1 })
          }
          className={claseSelect}
          style={estiloSelect}
        >
          <option value="" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            Todas las categorías
          </option>
          {categorias.map((categoria) => (
            <option
              key={categoria.id}
              value={categoria.id}
              style={{ backgroundColor: paleta.fondo, color: paleta.texto }}
            >
              {categoria.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: paleta.texto }}
        />
      </div>

      <div className="relative">
        <select
          aria-label="Filtrar por subcategoría"
          disabled={!filtros.categoriaId}
          value={filtros.subcategoriaId}
          onChange={(e) => actualizar({ subcategoriaId: e.target.value, pagina: 1 })}
          className={claseSelect}
          style={estiloSelect}
        >
          <option value="" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            Todas las subcategorías
          </option>
          {subcategorias.map((subcategoria) => (
            <option
              key={subcategoria.id}
              value={subcategoria.id}
              style={{ backgroundColor: paleta.fondo, color: paleta.texto }}
            >
              {subcategoria.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: paleta.texto }}
        />
      </div>

      <div className="relative">
        <select
          aria-label="Filtrar por stock"
          value={filtros.stock}
          onChange={(e) =>
            actualizar({ stock: e.target.value as FiltrosProductos["stock"], pagina: 1 })
          }
          className={claseSelect}
          style={estiloSelect}
        >
          <option value="" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            Todo el stock
          </option>
          <option value="en-stock" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            Con stock
          </option>
          <option value="bajo-stock" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            Stock bajo
          </option>
          <option value="sin-stock" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            Sin stock
          </option>
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: paleta.texto }}
        />
      </div>

      <button
        type="button"
        onClick={() => setMasAbierto((abierto) => !abierto)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
        style={{ border: `1px solid ${paleta.borde}`, color: paleta.texto }}
      >
        <SlidersHorizontal size={15} />
        Más filtros
      </button>

      {masAbierto && (
        <div className="flex w-full flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: paleta.borde }}>
          <div className="relative">
            <select
              aria-label="Filtrar por proveedor"
              value={filtros.proveedorId}
              onChange={(e) => actualizar({ proveedorId: e.target.value, pagina: 1 })}
              className={claseSelect}
              style={estiloSelect}
            >
              <option value="" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
                Todos los proveedores
              </option>
              {proveedores.map((proveedor) => (
                <option
                  key={proveedor.id}
                  value={proveedor.id}
                  style={{ backgroundColor: paleta.fondo, color: paleta.texto }}
                >
                  {proveedor.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: paleta.texto }}
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrar por estado"
              value={filtros.estado}
              onChange={(e) =>
                actualizar({ estado: e.target.value as FiltrosProductos["estado"], pagina: 1 })
              }
              className={claseSelect}
              style={estiloSelect}
            >
              <option value="" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
                Todos los estados
              </option>
              <option value="activo" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
                Activo
              </option>
              <option value="oculto" style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
                Oculto
              </option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: paleta.texto }}
            />
          </div>
        </div>
      )}
    </>
  );
}
