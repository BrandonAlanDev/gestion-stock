"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteLoader() {
  const pathname = usePathname();

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    });

    return () =>
      clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{
            scaleX: 0,
            opacity: 1,
          }}
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="
            fixed
            top-0
            left-0
            h-[3px]
            w-full
            origin-left
            z-[9999]
            bg-cyan-500
            shadow-[0_0_20px_rgba(6,182,212,0.8)]
          "
        />
      )}
    </AnimatePresence>
  );
}