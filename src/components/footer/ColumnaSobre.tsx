"use client";

interface ColumnaSobreProps {
  logo: string | null;
  storeName: string;
  texto: string | null;
}

export default function ColumnaSobre({ logo, storeName, texto }: ColumnaSobreProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {logo && (
          <img
            src={logo}
            alt={`Logo de ${storeName}`}
            className="h-10 w-10 rounded-lg object-cover"
          />
        )}
        <span className="text-lg font-bold">{storeName}</span>
      </div>
      {texto && (
        <p className="mt-3 text-sm leading-relaxed opacity-70">{texto}</p>
      )}
    </div>
  );
}
