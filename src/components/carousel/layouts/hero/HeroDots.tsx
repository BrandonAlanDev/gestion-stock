"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HeroDots({
  slidesCount,
  current,
  onChange,
}: {
  slidesCount: number;
  current: number;
  onChange: (index: number) => void;
}) {
  return (
    <motion.div
      className="absolute bottom-10 left-1/3 md:left-1/2 -translate-x-1/2 flex gap-3 z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {Array.from({ length: slidesCount }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onChange(index)}
          className={cn(
            "h-2.5 rounded-full transition-all duration-300",
            index === current ? "w-14" : "w-2.5"
          )}
          style={{
            backgroundColor: index === current ? "var(--color-primario)" : "rgba(255,255,255,0.4)",
            boxShadow: index === current ? "0 0 20px var(--color-primario)" : "none",
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Ir a slide ${index + 1}`}
        >
          <motion.span
            layoutId={`dot-${index}`}
            className={cn(
              "absolute inset-0 rounded-full",
              index === current ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundColor: "var(--color-primario)" }}
          />
        </motion.button>
      ))}
    </motion.div>
  );
}
