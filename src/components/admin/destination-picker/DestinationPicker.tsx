"use client";

import DestinationType from "@/components/admin/destination-picker/DestinationType";
import DestinationValue from "@/components/admin/destination-picker/DestinationValue";
import {
  Destination,
  DestinationPickerProps,
} from "@/components/admin/destination-picker/types";

export default function DestinationPicker({
  value,
  products,
  categories,
  onChange,
}: DestinationPickerProps) {
  function updateType(type: Destination["type"]) {
    onChange({
      type,
      value: "",
    });
  }

  function updateValue(newValue: string) {
    onChange({
      ...value,
      value: newValue,
    });
  }

  return (
    <div className="space-y-6">

      <DestinationType
        value={value.type}
        onChange={updateType}
      />

      <DestinationValue
        destination={value}
        products={products}
        categories={categories}
        onChange={updateValue}
      />

    </div>
  );
}