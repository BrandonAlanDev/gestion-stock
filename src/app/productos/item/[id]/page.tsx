import { getGarmentById } from "@/actions/garments";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const product = await getGarmentById(id);

  return <ProductDetailClient id={id} initialProduct={product} />;
}