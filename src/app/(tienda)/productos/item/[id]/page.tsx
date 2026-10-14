import { obtenerPrendaPorId } from "@/actions/prendas/obtener-prenda-por-id";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const product = await obtenerPrendaPorId(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient id={id} initialProduct={product} />;
}
