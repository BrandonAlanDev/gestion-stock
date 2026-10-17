import { revalidateTag } from "next/cache";

export function revalidarTalles(identificadorInquilino: string): void {
  void identificadorInquilino;
  revalidateTag(`sizeTypes`);
  revalidateTag(`products`);
}
