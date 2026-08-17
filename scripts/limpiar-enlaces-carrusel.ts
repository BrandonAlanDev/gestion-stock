import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { normalizarValorEnlace } from "../src/helpers/normalizarValorEnlace";

const esLocal =
  process.env.DATABASE_HOST === "localhost" ||
  process.env.DATABASE_HOST === "127.0.0.1";

const adaptador = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: esLocal ? false : { rejectUnauthorized: true },
  connectionLimit: 5,
  connectTimeout: 10000,
});

const prisma = new PrismaClient({ adapter: adaptador });

function enlaceLimpio(url: string): string | null {
  if (url.startsWith("/productos?categoria=")) {
    const destino = normalizarValorEnlace(url);
    return destino ? `/productos?categoria=${encodeURIComponent(destino)}` : null;
  }
  if (url.startsWith("/productos/item/")) {
    const destino = normalizarValorEnlace(url);
    return destino ? `/productos/item/${destino}` : null;
  }
  return url;
}

async function main() {
  const slides = await prisma.carouselSlide.findMany({
    select: { id: true, url: true },
  });
  let actualizadas = 0;
  for (const slide of slides) {
    if (!slide.url) continue;
    const limpio = enlaceLimpio(slide.url);
    if (!limpio || limpio === slide.url) continue;
    await prisma.carouselSlide.update({
      where: { id: slide.id },
      data: { url: limpio },
    });
    actualizadas++;
  }
  console.log(`CarouselSlide revisadas: ${slides.length} · enlaces normalizados: ${actualizadas}`);
}

main()
  .catch((error: unknown) => {
    console.error("Error al limpiar enlaces de carrusel:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
