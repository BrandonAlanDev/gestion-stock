// src/components/home/carousel-templates/HeroSimple.tsx
import Image from "next/image";

interface Props {
  image: string;
  alt?: string;
}

export default function HeroSimple({ image, alt }: Props) {
  return (
    <div className="relative w-full h-[70vh]">
      <Image src={image} alt={alt || ""} fill className="object-cover" priority />
    </div>
  );
}