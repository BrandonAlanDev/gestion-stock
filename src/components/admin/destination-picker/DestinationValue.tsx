"use client";

import SearchableSelect from "@/components/admin/destination-picker/SearchableSelect";
import ExternalUrl from "@/components/admin/destination-picker/ExternalUrl";
import { Destination, SelectItem } from "@/components/admin/destination-picker/types";

interface Props {
  destination: Destination;

  categories: SelectItem[];

  products: SelectItem[];

  pages?: SelectItem[];

  onChange: (value: string) => void;
}

export default function DestinationValue({
  destination,
  categories,
  products,
  pages = [],
  onChange,
}: Props) {

  switch (destination.type) {

    case "category":

      return (
        <SearchableSelect
          label="Categoría"
          placeholder="Buscar categoría..."
          value={destination.value}
          items={categories}
          onChange={onChange}
        />
      );

    case "product":

      return (
        <SearchableSelect
          label="Producto"
          placeholder="Buscar producto..."
          value={destination.value}
          items={products}
          onChange={onChange}
        />
      );

    case "page":

      return (
        <SearchableSelect
          label="Página"
          placeholder="Buscar página..."
          value={destination.value}
          items={pages}
          onChange={onChange}
        />
      );

    case "external":

      return (
        <ExternalUrl
          value={destination.value}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}