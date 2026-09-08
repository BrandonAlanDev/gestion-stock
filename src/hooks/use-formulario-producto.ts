"use client";

import { toast } from "sonner";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createGarment, updateGarment } from "@/actions/garments";
import type { PendingImage } from "@/components/providers/products/forms/ImageUploader";
import type { ParOpcionValor } from "@/types/productos/opciones-producto";
import { claveOpcionValor } from "@/lib/productos/normalizar-opciones";

export const MAX_OPCIONES = 3;

export interface OpcionFormulario {
  name: string;
  values: string[];
}

export interface VarianteFormulario {
  id?: string;
  opcionValores: ParOpcionValor[];
  stock: number;
  sku: string;
  priceOverride: string;
}

export interface ProductoEdicion {
  id: string;
  name?: string;
  price?: number | string | { toString(): string };
  maxPrice?: number | string | { toString(): string } | null;
  description?: string | null;
  categoryId?: string;
  subCategoryId?: string | null;
  etiquetas?: string[] | null;
  controlaStock?: boolean;
  activo?: boolean;
  opciones?: Array<{ id?: string; name: string; values?: Array<{ id?: string; value: string }> }>;
  variants?: Array<{
    id?: string;
    stock?: number;
    sku?: string | null;
    priceOverride?: number | string | null;
    opcionValores?: ParOpcionValor[];
  }>;
  images?: Array<{ srcImage: string; publicId?: string | null }>;
}

interface UseFormularioProductoProps {
  producto?: ProductoEdicion | null;
  categorias: CategoriaEdicion[];
}

export interface CategoriaEdicion {
  id: string;
  name: string;
  subCategories?: Array<{ id: string; name: string }>;
}

const VALORES_VACIOS = {
  name: "",
  price: "",
  maxPrice: "",
  description: "",
  categoryId: "",
  subCategoryId: "",
  etiquetas: [] as string[],
  controlaStock: true,
  activo: true,
  opciones: [] as OpcionFormulario[],
  variantes: [{ opcionValores: [], stock: 0, sku: "", priceOverride: "" }] as VarianteFormulario[],
  images: [] as PendingImage[],
};

function claveCombinacion(opcionValores: ParOpcionValor[]): string {
  return opcionValores.map(claveOpcionValor).sort().join("|");
}

function productoCartesiano(opciones: OpcionFormulario[]): Array<{ opcion: string; valor: string }[]> {
  if (opciones.length === 0) return [[]];
  const [primera, ...resto] = opciones;
  const combinacionesResto = productoCartesiano(resto);
  const resultado: Array<{ opcion: string; valor: string }[]> = [];
  for (const valor of primera.values) {
    for (const restoCombo of combinacionesResto) {
      resultado.push([{ opcion: primera.name, valor }, ...restoCombo]);
    }
  }
  return resultado;
}

export function useFormularioProducto({ producto, categorias }: UseFormularioProductoProps) {
  const [formData, setFormData] = useState(VALORES_VACIOS);
  const esEdicion = Boolean(producto?.id);
  const editadoRef = useRef(false);

  useEffect(() => {
    if (!producto) {
      setFormData(VALORES_VACIOS);
      return;
    }
    const opcionesCargadas: OpcionFormulario[] = (producto.opciones ?? []).map((o) => ({
      name: o.name,
      values: (o.values ?? []).map((v) => v.value),
    }));
    const variantesCargadas: VarianteFormulario[] = (producto.variants ?? []).map((v) => ({
      id: v.id,
      opcionValores: v.opcionValores ?? [],
      stock: v.stock ?? 0,
      sku: v.sku ?? "",
      priceOverride: v.priceOverride != null && v.priceOverride !== "" ? String(v.priceOverride) : "",
    }));
    setFormData({
      name: producto.name || "",
      price: producto.price?.toString() ?? "",
      maxPrice: producto.maxPrice?.toString() ?? "",
      description: producto.description || "",
      categoryId: producto.categoryId || "",
      subCategoryId: producto.subCategoryId || "",
      etiquetas: producto.etiquetas ?? [],
      controlaStock: producto.controlaStock ?? true,
      activo: producto.activo ?? true,
      opciones: opcionesCargadas,
      variantes: variantesCargadas,
      images: (producto.images ?? []).map((img) => ({ url: img.srcImage, publicId: img.publicId ?? "" })),
    });
    editadoRef.current = false;
  }, [producto]);

  const categoriaSeleccionada = useMemo(
    () => categorias.find((c) => c.id === formData.categoryId),
    [formData.categoryId, categorias]
  );
  const subcategoriasDisponibles = useMemo(
    () => categoriaSeleccionada?.subCategories ?? [],
    [categoriaSeleccionada]
  );

  const setField = useCallback((campo: string, valor: unknown) => {
    editadoRef.current = true;
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const manejarCategoria = useCallback((categoryId: string) => {
    editadoRef.current = true;
    setFormData((prev) => ({ ...prev, categoryId, subCategoryId: "" }));
  }, []);

  const manejarSubcategoria = useCallback((subCategoryId: string) => {
    editadoRef.current = true;
    setFormData((prev) => ({ ...prev, subCategoryId }));
  }, []);

  const agregarEtiqueta = useCallback((etiqueta: string) => {
    const nueva = etiqueta.trim();
    if (!nueva) return;
    editadoRef.current = true;
    setFormData((prev) => {
      if (prev.etiquetas.includes(nueva)) return prev;
      return { ...prev, etiquetas: [...prev.etiquetas, nueva] };
    });
  }, []);

  const eliminarEtiqueta = useCallback((etiqueta: string) => {
    editadoRef.current = true;
    setFormData((prev) => ({ ...prev, etiquetas: prev.etiquetas.filter((e) => e !== etiqueta) }));
  }, []);

  const recalcularVariantes = useCallback((opciones: OpcionFormulario[], previas: VarianteFormulario[]) => {
    const opcionesUtilizables = opciones
      .map((o) => ({ name: o.name.trim(), values: o.values.map((v) => v.trim()).filter((v) => v !== "") }))
      .filter((o) => o.name !== "" && o.values.length > 0);
    if (opcionesUtilizables.length === 0) {
      const stockTotal = previas.reduce((acc, v) => acc + v.stock, 0);
      const sku = previas.find((v) => v.sku.trim() !== "")?.sku ?? "";
      const varianteBase = previas[0];
      return [
        {
          id: varianteBase?.id,
          opcionValores: [],
          stock: stockTotal,
          sku,
          priceOverride: varianteBase?.priceOverride ?? "",
        } as VarianteFormulario,
      ];
    }
    const combinaciones = productoCartesiano(opcionesUtilizables);
    const clavesPrevias = new Map(previas.map((v) => [claveCombinacion(v.opcionValores), v]));
    return combinaciones.map((comb) => {
      const clave = claveCombinacion(comb);
      const previa = clavesPrevias.get(clave);
      return {
        id: previa?.id,
        opcionValores: comb,
        stock: previa?.stock ?? 0,
        sku: previa?.sku ?? "",
        priceOverride: previa?.priceOverride ?? "",
      };
    });
  }, []);

  const agregarOpcion = useCallback(() => {
    setFormData((prev) => {
      if (prev.opciones.length >= MAX_OPCIONES) {
        toast.error(`Máximo ${MAX_OPCIONES} opciones por producto.`);
        return prev;
      }
      const opciones = [...prev.opciones, { name: "", values: [""] }];
      return { ...prev, opciones, variantes: recalcularVariantes(opciones, prev.variantes) };
    });
  }, [recalcularVariantes]);

  const eliminarOpcion = useCallback((indice: number) => {
    setFormData((prev) => {
      const opciones = prev.opciones.filter((_, i) => i !== indice);
      return { ...prev, opciones, variantes: recalcularVariantes(opciones, prev.variantes) };
    });
  }, [recalcularVariantes]);

  const cambiarNombreOpcion = useCallback((indice: number, name: string) => {
    setFormData((prev) => {
      const nombreAnterior = prev.opciones[indice]?.name;
      const opciones = prev.opciones.map((o, i) => (i === indice ? { ...o, name } : o));
      const variantes = prev.variantes.map((variante) => ({
        ...variante,
        opcionValores: variante.opcionValores.map((par) =>
          par.opcion.trim().toLowerCase() === nombreAnterior?.trim().toLowerCase()
            ? { ...par, opcion: name }
            : par
        ),
      }));
      return { ...prev, opciones, variantes };
    });
  }, []);

  const cambiarValorOpcion = useCallback((indice: number, indiceValor: number, valor: string) => {
    setFormData((prev) => {
      const opciones = prev.opciones.map((opcion, i) => {
        if (i !== indice) return opcion;
        const values = opcion.values.map((v, j) => (j === indiceValor ? valor : v));
        return { ...opcion, values };
      });
      return { ...prev, opciones, variantes: recalcularVariantes(opciones, prev.variantes) };
    });
  }, [recalcularVariantes]);

  const agregarValorOpcion = useCallback((indice: number) => {
    setFormData((prev) => {
      const opciones = prev.opciones.map((opcion, i) => {
        if (i !== indice) return opcion;
        return { ...opcion, values: [...opcion.values, ""] };
      });
      return { ...prev, opciones, variantes: recalcularVariantes(opciones, prev.variantes) };
    });
  }, [recalcularVariantes]);

  const eliminarValorOpcion = useCallback((indice: number, indiceValor: number) => {
    setFormData((prev) => {
      const opciones = prev.opciones.map((opcion, i) => {
        if (i !== indice) return opcion;
        return { ...opcion, values: opcion.values.filter((_, j) => j !== indiceValor) };
      });
      return { ...prev, opciones, variantes: recalcularVariantes(opciones, prev.variantes) };
    });
  }, [recalcularVariantes]);

  const actualizarVariante = useCallback((indice: number, campo: "stock" | "sku" | "priceOverride", valor: unknown) => {
    setFormData((prev) => {
      const variantes = prev.variantes.map((v, i) => (i === indice ? { ...v, [campo]: valor } : v));
      return { ...prev, variantes };
    });
  }, []);

  const agregarImagenes = useCallback((nuevas: PendingImage[]) => {
    editadoRef.current = true;
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...nuevas] }));
  }, []);

  const eliminarImagen = useCallback((indice: number) => {
    setFormData((prev) => {
      const imagen = prev.images[indice];
      if (imagen.preview && !imagen.url && imagen.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imagen.preview);
      }
      return { ...prev, images: prev.images.filter((_, i) => i !== indice) };
    });
  }, []);

  const reordenarImagenes = useCallback((origen: number, destino: number) => {
    setFormData((prev) => {
      const copia = [...prev.images];
      const [movida] = copia.splice(origen, 1);
      copia.splice(destino, 0, movida);
      return { ...prev, images: copia };
    });
  }, []);

  const editarImagen = useCallback((indice: number, preview: string) => {
    setFormData((prev) => {
      const images = [...prev.images];
      images[indice] = { ...images[indice], preview, file: undefined };
      return { ...prev, images };
    });
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = useCallback(async (comoBorrador: boolean) => {
    const imagenesFinales: string[] = [];
    for (const img of formData.images) {
      try {
        if (img.file) {
          const base64 = await fileToBase64(img.file);
          imagenesFinales.push(base64);
        } else if (img.preview && img.preview.startsWith("data:")) {
          imagenesFinales.push(img.preview);
        } else if (img.url) {
          imagenesFinales.push(img.url);
        }
      } catch (error) {
        console.error("Error al procesar imagen individual:", error);
        toast.error("Error al procesar una imagen. Se omitirá.");
      }
    }
    if (imagenesFinales.length === 0 && formData.images.length > 0) {
      throw new Error("No se pudo subir ninguna imagen. Revisá los archivos e intentá de nuevo.");
    }

    const activo = comoBorrador ? false : formData.activo !== false;
    const opcionesValidas = formData.opciones
      .map((opcion) => ({ name: opcion.name.trim(), values: opcion.values.map((v) => v.trim()).filter((v) => v !== "") }))
      .filter((opcion) => opcion.name !== "" && opcion.values.length > 0);

    const variantesCoherentes = recalcularVariantes(opcionesValidas, formData.variantes);

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null,
      description: formData.description,
      categoryId: formData.categoryId,
      subCategoryId: formData.subCategoryId || null,
      controlaStock: formData.controlaStock,
      activo,
      etiquetas: formData.etiquetas,
      opciones: opcionesValidas,
      variants: variantesCoherentes.map((v) => ({
        id: v.id,
        opcionValores: v.opcionValores,
        stock: Number(v.stock) || 0,
        sku: v.sku,
        priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
      })),
      images: imagenesFinales,
    };

    if (esEdicion && producto?.id) {
      return updateGarment(producto.id, payload);
    }
    return createGarment(payload);
  }, [formData, esEdicion, producto, recalcularVariantes]);

  const resetear = useCallback(() => setFormData(VALORES_VACIOS), []);

  return {
    formData,
    esEdicion,
    editadoRef,
    categoriaSeleccionada,
    subcategoriasDisponibles,
    setField,
    manejarCategoria,
    manejarSubcategoria,
    agregarEtiqueta,
    eliminarEtiqueta,
    agregarOpcion,
    eliminarOpcion,
    cambiarNombreOpcion,
    cambiarValorOpcion,
    agregarValorOpcion,
    eliminarValorOpcion,
    actualizarVariante,
    agregarImagenes,
    eliminarImagen,
    reordenarImagenes,
    editarImagen,
    handleSubmit,
    resetear,
  };
}
