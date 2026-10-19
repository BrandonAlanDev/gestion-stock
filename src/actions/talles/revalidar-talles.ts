import { revalidateTag } from "next/cache";

export function revalidarTalles(identificadorInquilino: string): void {
  revalidateTag(`tenant:${identificadorInquilino}:sizeTypes`);
  revalidateTag(`tenant:${identificadorInquilino}:products`);
}
