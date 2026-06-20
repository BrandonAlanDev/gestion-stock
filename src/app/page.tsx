import prisma from "@/lib/prisma"; // Asegúrate de que esta ruta apunte a tu instancia de Prisma
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  // Buscamos la configuración global con ID 1
  const pageConfig = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  return <HomeClient pageConfig={pageConfig} />;
}