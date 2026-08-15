import Badge from "@/components/ui/badge";

interface CarruselResumen {
  id: string;
  type: string;
  title: string | null;
}

interface PropsContenido {
  cargados: boolean;
  carouseles: CarruselResumen[];
  tarjetas: number;
  paginasDinamicas: number;
}

export default function BloqueContenido({
  cargados,
  carouseles,
  tarjetas,
  paginasDinamicas,
}: PropsContenido) {
  function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--admin-texto-suave)]">{etiqueta}</span>
        <span className="text-sm font-semibold text-[var(--admin-texto)]">{valor}</span>
      </div>
    );
  }

  if (!cargados) {
    return <p className="text-sm text-[var(--admin-texto-suave)]">No se pudo cargar</p>;
  }

  const totalHero = carouseles.filter((c) => c.type === "HERO").length;
  const totalBanners = carouseles.filter((c) => c.type === "BANNER").length;
  const totalTarjetas = carouseles.filter((c) => c.type === "CARDS").length;

  return (
    <>
      <FilaResumen etiqueta="Carruseles" valor={String(carouseles.length)} />
      <FilaResumen etiqueta="Portadas (hero)" valor={String(totalHero)} />
      <FilaResumen etiqueta="Banners" valor={String(totalBanners)} />
      <FilaResumen etiqueta="Tarjetas" valor={String(totalTarjetas)} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--admin-texto-suave)]">Sección destacada</span>
        {tarjetas > 0 ? (
          <span className="text-sm font-semibold text-[var(--admin-texto)]">
            Con {tarjetas} tarjetas
          </span>
        ) : (
          <Badge variante="sin-configurar">Sin configurar</Badge>
        )}
      </div>
      <FilaResumen
        etiqueta="Páginas dinámicas"
        valor={String(paginasDinamicas)}
      />
    </>
  );
}
