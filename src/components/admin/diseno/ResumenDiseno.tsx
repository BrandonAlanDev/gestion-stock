import Link from "next/link";
import {
  FileText,
  LayoutList,
  ListOrdered,
  Palette,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { getCarousels } from "@/actions/carousel/carousel.actions";
import { getCustomPages } from "@/actions/custom-page.actions";
import { getPageConfig } from "@/actions/page-config/general.actions";
import BloqueContenido from "@/components/admin/diseno/BloqueContenido";
import BloqueEstructura from "@/components/admin/diseno/BloqueEstructura";
import BloqueIdentidadVisual from "@/components/admin/diseno/BloqueIdentidadVisual";
import BloquePaginas from "@/components/admin/diseno/BloquePaginas";
import BloqueSeo from "@/components/admin/diseno/BloqueSeo";

interface CarruselResumen {
  id: string;
  type: string;
  title: string | null;
}

interface PropsBloque {
  icono: LucideIcon;
  titulo: string;
  href: string;
  hrefEtiqueta: string;
  className?: string;
  children: ReactNode;
}

export default async function ResumenDiseno() {
  const [respuestaConfig, respuestaCarouseles, paginasDinamicas] =
    await Promise.all([getPageConfig(), getCarousels(), getCustomPages()]);

  const pageConfig = respuestaConfig.ok
    ? (respuestaConfig.pageConfig ?? null)
    : null;
  const carouseles: CarruselResumen[] = respuestaCarouseles.success
    ? respuestaCarouseles.data.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title ?? null,
      }))
    : (pageConfig?.carousels ?? []);
  const cargados = respuestaCarouseles.success || respuestaConfig.ok;
  const tarjetasDestacadas = pageConfig?.homegrid?.grids.length ?? 0;

  function BloqueResumen({
    icono: Icono,
    titulo,
    href,
    hrefEtiqueta,
    className,
    children,
  }: PropsBloque) {
    return (
      <section
        className={`rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-5 ${className ?? ""}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icono size={16} className="text-[var(--admin-primario)]" />
            <h2 className="text-sm font-semibold text-[var(--admin-texto)]">{titulo}</h2>
          </div>
          <Link
            href={href}
            className="text-xs font-medium text-[var(--admin-primario)] hover:underline"
          >
            {hrefEtiqueta}
          </Link>
        </div>
        <div className="space-y-2.5">{children}</div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--admin-texto-suave)]">
        Así está configurada tu tienda hoy. Entrá a cualquier área para editarla.
      </p>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BloqueResumen
          icono={Palette}
          titulo="Identidad visual"
          href="/admin/design/apariencia"
          hrefEtiqueta="Editar"
        >
          <BloqueIdentidadVisual config={pageConfig} />
        </BloqueResumen>

        <BloqueResumen
          icono={LayoutList}
          titulo="Contenido"
          href="/admin/design/contenido"
          hrefEtiqueta="Editar"
        >
          <BloqueContenido
            cargados={cargados}
            carouseles={carouseles}
            tarjetas={tarjetasDestacadas}
            paginasDinamicas={paginasDinamicas.length}
          />
        </BloqueResumen>

        <BloqueResumen
          icono={FileText}
          titulo="Páginas"
          href="/admin/design/contenido"
          hrefEtiqueta="Editar"
        >
          <BloquePaginas config={pageConfig} paginas={paginasDinamicas} />
        </BloqueResumen>

        <BloqueResumen
          icono={ListOrdered}
          titulo="Estructura"
          href="/admin/design/estructura"
          hrefEtiqueta="Editar"
        >
          <BloqueEstructura config={pageConfig} />
        </BloqueResumen>

        <BloqueResumen
          icono={Search}
          titulo="SEO"
          href="/admin/pageConfig"
          hrefEtiqueta="Configurar"
          className="lg:col-span-2"
        >
          <BloqueSeo config={pageConfig} />
        </BloqueResumen>
      </div>
    </div>
  );
}
