export interface VersionTarjetaCatalogo {
  id: string;
  updatedAt: string;
  slug: string;
}

export function idsTarjetasFaltantes(
  pagina: VersionTarjetaCatalogo[],
  conocidas: VersionTarjetaCatalogo[]
) {
  const porId = new Map(conocidas.map((producto) => [producto.id, producto]));
  return pagina.filter((producto) => {
    const conocida = porId.get(producto.id);
    return conocida?.updatedAt !== producto.updatedAt || conocida.slug !== producto.slug;
  }).map((producto) => producto.id);
}
