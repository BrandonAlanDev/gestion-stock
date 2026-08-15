"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Tag,
  Search,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { getContrastColor } from "@/lib/utils";

interface IconoFlotante {
  icono: LucideIcon;
  tamano: string;
  posicion: string;
  retraso: number;
  variante: "primario" | "secundario";
}

interface NotFoundClientProps {
  primaryColor: string;
  secondaryColor: string;
  storeName: string;
  logo: string | null;
}

const ICONOS_FLOTANTES: IconoFlotante[] = [
  { icono: ShoppingBag, tamano: "w-16 h-16", posicion: "top-[12%] left-[8%]", retraso: 0, variante: "primario" },
  { icono: Package, tamano: "w-14 h-14", posicion: "top-[18%] right-[10%]", retraso: 0.6, variante: "secundario" },
  { icono: Tag, tamano: "w-12 h-12", posicion: "bottom-[22%] left-[14%]", retraso: 1.2, variante: "secundario" },
  { icono: Search, tamano: "w-14 h-14", posicion: "bottom-[16%] right-[12%]", retraso: 1.8, variante: "primario" },
  { icono: Truck, tamano: "w-12 h-12", posicion: "top-[42%] right-[4%]", retraso: 2.4, variante: "primario" },
];

const TRANSICION_APARICION = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
};

function IconoFlotanteBurbuja({
  item,
  primaryColor,
  secondaryColor,
}: {
  item: IconoFlotante;
  primaryColor: string;
  secondaryColor: string;
}) {
  const esPrimario = item.variante === "primario";
  const colorFondo = esPrimario ? primaryColor : secondaryColor;
  const colorIcono = esPrimario ? getContrastColor(primaryColor) : primaryColor;
  const Icono = item.icono;

  return (
    <motion.div
      className={`absolute ${item.posicion} hidden md:block`}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: item.retraso + 0.3 },
        scale: { duration: 0.6, delay: item.retraso + 0.3 },
        y: {
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: item.retraso,
        },
      }}
    >
      <div
        className={`${item.tamano} rounded-full flex items-center justify-center shadow-lg`}
        style={{
          backgroundColor: colorFondo,
          border: `1px solid ${primaryColor}30`,
          boxShadow: `0 8px 24px ${primaryColor}25`,
        }}
      >
        <Icono
          className="w-1/2 h-1/2"
          style={{ color: colorIcono }}
          strokeWidth={2}
        />
      </div>
    </motion.div>
  );
}

export default function NotFoundClient({
  primaryColor,
  secondaryColor,
  storeName,
  logo,
}: NotFoundClientProps) {
  const colorTextoPrimario = getContrastColor(primaryColor);

  return (
    <main
      className="relative min-h-[70vh] flex-1 flex items-center justify-center overflow-hidden px-4 py-16"
      style={{ backgroundColor: `${secondaryColor}55` }}
    >
      <motion.div
        aria-hidden
        className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${primaryColor}30` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-15%] right-[-8%] w-[50%] h-[60%] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${primaryColor}25` }}
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <div className="relative max-w-2xl w-full flex flex-col items-center text-center">
        {logo ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...TRANSICION_APARICION, delay: 0.1 }}
          >
            <Image
              src={logo}
              alt={storeName}
              width={160}
              height={64}
              className="h-16 w-auto object-contain mb-6"
            />
          </motion.div>
        ) : null}

        <div className="relative mb-8 flex items-center justify-center w-full">
          <motion.h1
            className="text-[8rem] leading-none md:text-[10rem] font-black tracking-tighter select-none"
            style={{ color: primaryColor }}
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}
          >
            404
          </motion.h1>

          {ICONOS_FLOTANTES.map((item, index) => (
            <IconoFlotanteBurbuja
              key={index}
              item={item}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ))}
        </div>

        <motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSICION_APARICION, delay: 0.5 }}
        >
          ¡Ups! No encontramos lo que buscabas
        </motion.h2>

        <motion.p
          className="text-base md:text-lg text-gray-600 mb-10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSICION_APARICION, delay: 0.65 }}
        >
          Parece que este producto o página ya no está disponible, o la URL no es
          correcta.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSICION_APARICION, delay: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
                color: colorTextoPrimario,
              }}
            >
              Volver al inicio
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold transition-colors hover:bg-white/60"
              style={{
                color: primaryColor,
                border: `2px solid ${primaryColor}`,
              }}
            >
              Ver catálogo
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
