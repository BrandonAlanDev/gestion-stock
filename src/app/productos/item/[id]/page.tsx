import { notFound } from "next/navigation";
import { getGarmentById } from "@/actions/garments";
import ProductoView from "@/components/products/views/ProductoView";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;

  // =========================================
  // GET PRODUCTO DESDE PRISMA
  // =========================================
  const product = await getGarmentById(id);

  // =========================================
  // NOT FOUND
  // =========================================
  if (!product || !product.active) {
    notFound();
  }

  // =========================================
  // RENDER
  // =========================================
  return (
    <ProductoView product={product} />
  );
}