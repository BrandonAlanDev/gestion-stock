"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ExternalUrl({
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">

      <label className="text-sm font-bold">

        URL

      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
      />

      <p className="text-xs text-neutral-500">
        Ejemplo: https://google.com
      </p>

    </div>
  );
}