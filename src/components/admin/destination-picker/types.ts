export type DestinationType =
  | "none"
  | "category"
  | "product"
  | "page"
  | "external";

export interface Destination {
  type: DestinationType;
  value: string;
}

export interface SelectItem {
  id: string;
  label: string;
}

export interface SearchableSelectProps {
  label: string;
  placeholder?: string;

  value: string;

  items: SelectItem[];

  onChange: (value: string) => void;
}

export interface DestinationPickerProps {
  value: Destination;

  products: SelectItem[];

  categories: SelectItem[];

  pages?: SelectItem[];

  onChange: (destination: Destination) => void;
}