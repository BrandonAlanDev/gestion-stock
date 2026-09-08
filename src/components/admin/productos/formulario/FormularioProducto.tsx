"use client";

import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Package, Edit3 } from "lucide-react";
import { getGarmentById } from "@/actions/garments";
import { useFormularioProducto, type CategoriaEdicion } from "@/hooks/use-formulario-producto";
import { adaptarProductoEdicion } from "@/lib/productos/adaptar-producto-edicion";
import ProductoInformacionBasica from "./ProductoInformacionBasica";
import ProductoImagenes from "./ProductoImagenes";
import ProductoPrecio from "./ProductoPrecio";
import ProductoOrganizacion from "./ProductoOrganizacion";
import ProductoEstadoVisibilidad from "./ProductoEstadoVisibilidad";
import ProductoInventario from "./ProductoInventario";
import ProductoOpciones from "./ProductoOpciones";
import PieFormularioProducto from "./PieFormularioProducto";
import { CLASE_BOTON_PRIMARIO } from "@/lib/productos/estilos";
import type {
  CategoriaAdministracion,
  ProductoAdministracion,
} from "@/types/productos/administracion-productos";

interface Props {
  categorias: CategoriaAdministracion[];
  productoSemilla?: ProductoAdministracion | null;
  onSuccess?: () => void;
  open?: boolean;
  onClose?: () => void;
}

export default function FormularioProducto({ categorias, productoSemilla, onSuccess, open, onClose }: Props) {
  const [abiertoInterno, setAbiertoInterno] = useState(false);
  const esControlado = open !== undefined;
  const abierto = esControlado ? !!open : abiertoInterno;

  const cerrar = () => {
    if (esControlado) onClose?.();
    else setAbiertoInterno(false);
  };

  const [cargando, setCargando] = useState(false);
  const [montado, setMontado] = useState(false);
  const [productoCompleto, setProductoCompleto] = useState<ReturnType<typeof adaptarProductoEdicion> | null>(null);
  const idSemilla = productoSemilla?.id;

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    let cancelado = false;
    if (!idSemilla) {
      setProductoCompleto(null);
      return;
    }
    getGarmentById(idSemilla).then((data) => {
      if (!cancelado && data) setProductoCompleto(adaptarProductoEdicion(data as never));
    });
    return () => {
      cancelado = true;
    };
  }, [idSemilla]);

  const hook = useFormularioProducto({
    producto: productoCompleto,
    categorias: categorias as CategoriaEdicion[],
  });
  const { formData } = hook;

  const conVariantes = formData.opciones.length > 0;
  const varianteBase = formData.variantes[0];

  const ejecutarSubmit = async (comoBorrador: boolean) => {
    try {
      setCargando(true);
      const resultado = await hook.handleSubmit(comoBorrador);
      if (resultado && "error" in resultado && resultado.error) {
        toast.error(typeof resultado.error === "string" ? resultado.error : "Error de validación de datos");
        return;
      }
      toast.success(hook.esEdicion ? "Producto actualizado" : "Producto creado");
      onSuccess?.();
      if (!hook.esEdicion) hook.resetear();
      cerrar();
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setCargando(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ejecutarSubmit(false);
  };

  if (!montado) return null;

  const trigger = !esControlado ? (
    productoSemilla ? (
      <button
        type="button"
        onClick={() => setAbiertoInterno(true)}
        className="flex cursor-pointer items-center gap-1 text-xs font-semibold uppercase text-[var(--admin-primario)] hover:underline"
      >
        <Edit3 size={14} />
        Editar
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setAbiertoInterno(true)}
        className={`${CLASE_BOTON_PRIMARIO} cursor-pointer`}
      >
        <Package size={16} />
        + Nuevo Producto
      </button>
    )
  ) : null;

  if (!abierto) return trigger;

  return (
    <>
      {trigger}
      {createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-6 py-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--admin-texto)]">
              {hook.esEdicion ? (
                <Edit3 size={20} className="text-[var(--admin-primario)]" />
              ) : (
                <Package size={20} className="text-[var(--admin-primario)]" />
              )}
              {hook.esEdicion ? "Editar producto" : "Crear producto"}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--admin-texto-suave)]">
              Completá la información de tu producto.
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="cursor-pointer rounded-md p-2 text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body + footer dentro del form */}
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_400px]">
              <div className="space-y-8">
                <ProductoInformacionBasica
                  name={formData.name}
                  description={formData.description}
                  onName={(v) => hook.setField("name", v)}
                  onDescription={(v) => hook.setField("description", v)}
                />
                <ProductoImagenes
                  images={formData.images}
                  onAddImages={hook.agregarImagenes}
                  onRemoveImage={hook.eliminarImagen}
                  onReorder={hook.reordenarImagenes}
                  onEdit={hook.editarImagen}
                />
                <ProductoPrecio
                  price={formData.price}
                  maxPrice={formData.maxPrice}
                  onPrice={(v) => hook.setField("price", v)}
                  onMaxPrice={(v) => hook.setField("maxPrice", v)}
                />
              </div>
              <div className="space-y-8">
                <ProductoOrganizacion
                  categorias={categorias}
                  subcategorias={hook.subcategoriasDisponibles}
                  categoryId={formData.categoryId}
                  subCategoryId={formData.subCategoryId}
                  etiquetas={formData.etiquetas}
                  onChangeCategoria={hook.manejarCategoria}
                  onChangeSubcategoria={hook.manejarSubcategoria}
                  onAgregarEtiqueta={hook.agregarEtiqueta}
                  onEliminarEtiqueta={hook.eliminarEtiqueta}
                />
                <ProductoEstadoVisibilidad activo={formData.activo} onChange={(v) => hook.setField("activo", v)} />
                <ProductoInventario
                  controlaStock={formData.controlaStock}
                  onControlaStock={(v) => hook.setField("controlaStock", v)}
                  conVariantes={conVariantes}
                  stock={conVariantes ? "" : String(varianteBase?.stock ?? 0)}
                  onStock={(v) => hook.actualizarVariante(0, "stock", parseInt(v) || 0)}
                  codigo={conVariantes ? "" : varianteBase?.sku ?? ""}
                  onCodigo={(v) => hook.actualizarVariante(0, "sku", v)}
                />
                <ProductoOpciones
                  opciones={formData.opciones}
                  variantes={formData.variantes}
                  precioGeneral={formData.price}
                  onAgregarOpcion={hook.agregarOpcion}
                  onEliminarOpcion={hook.eliminarOpcion}
                  onCambiarNombreOpcion={hook.cambiarNombreOpcion}
                  onCambiarValorOpcion={hook.cambiarValorOpcion}
                  onAgregarValorOpcion={hook.agregarValorOpcion}
                  onEliminarValorOpcion={hook.eliminarValorOpcion}
                  onActualizarVariante={hook.actualizarVariante}
                />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 z-10">
            <PieFormularioProducto
              esEdicion={hook.esEdicion}
              cargando={cargando}
              onCancelar={cerrar}
              onGuardarBorrador={() => void ejecutarSubmit(true)}
            />
          </div>
        </form>
      </div>
    </div>,
      document.body
    )}
    </>
  );
}
