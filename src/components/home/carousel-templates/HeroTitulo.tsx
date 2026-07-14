// HeroTitulo.tsx (ejemplo para HERO_TITULO)
import Image from "next/image";

interface Props {
  image: string;
  title: string;
  subtitle?: string;
}

export default function HeroTitulo({ image, title, subtitle }: Props) {
  return (
    <div className="relative w-full h-[70vh]">
      <Image src={image} alt={title} fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute bottom-20 left-10 text-white">
        <h1 className="text-5xl font-bold drop-shadow-lg">{title}</h1>
        {subtitle && <p className="text-xl mt-2 drop-shadow">{subtitle}</p>}
      </div>
    </div>
  );
}