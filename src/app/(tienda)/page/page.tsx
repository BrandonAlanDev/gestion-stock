import PageRenderer from "@/components/custompage/PageRender";
import { conPrisma } from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { notFound } from "next/navigation";

interface Propiedades {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RutaPaginaPersonalizada({ searchParams }: Propiedades) {
  await requiereTenantActivo();
  const parametros = await searchParams;
  const tituloConsulta = typeof parametros.title === "string" ? parametros.title : undefined;

  if (!tituloConsulta) {
    return notFound();
  }

  const paginaPersonalizada = await conPrisma((prisma) =>
    prisma.customPage.findUnique({
      where: {
        slug: tituloConsulta,
      },
      include: {
        sections: {
          where: {},
          orderBy: { order: "asc" },
          include: {
            items: {
              where: {},
              orderBy: { order: "asc" },
            },
          },
        },
      },
    }),
  );

  if (!paginaPersonalizada?.isActive) {
    return notFound();
  }

  const paginaFormateada = {
    ...paginaPersonalizada,
    sections: paginaPersonalizada.sections.map((seccion) => ({
      ...seccion,
      config: seccion.config ? JSON.parse(JSON.stringify(seccion.config)) : undefined,
      items: seccion.items.map((elemento) => ({
        ...elemento,
        config: elemento.config ? JSON.parse(JSON.stringify(elemento.config)) : undefined,
      })),
    })),
  };

  return <PageRenderer page={paginaFormateada} />;
}
