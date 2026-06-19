import prisma from "@/lib/prisma";
import PageRenderer from "@/components/custompage/PageRender";
import { notFound } from "next/navigation";

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CustomPageBuilderRoute({ searchParams }: Props) {
  const queryTitle = typeof searchParams.title === "string" ? searchParams.title : undefined;

  if (!queryTitle) {
    return notFound();
  }

  const customPage = await prisma.customPage.findUnique({
    where: { 
      slug: queryTitle 
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!customPage || !customPage.isActive) {
    return notFound();
  }

  const formattedPage = {
    ...customPage,
    sections: customPage.sections.map(section => ({
      ...section,
      type: section.type as "HERO" | "TEXT" | "CARDS" | "FAQ" | "TIMELINE" | "CTA" | "GALLERY" | "FEATURES",
      config: section.config ? JSON.parse(JSON.stringify(section.config)) : undefined,
      items: section.items.map(item => ({
        ...item,
        config: item.config ? JSON.parse(JSON.stringify(item.config)) : undefined,
      }))
    }))
  };

  return (
    <PageRenderer page={formattedPage} />
  );
}