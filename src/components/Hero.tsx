"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Clock, Shield} from "lucide-react";
import heroImage from "@/assets/fondoropa.avif";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Lavado profesional de vehículos"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/40 to-black/0" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 pt-20">
        <div className="max-w-2xl">

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
          >
            <span>Gestiona tu stock {" "} <span className="bg-linear-to-r from-[#a3e8ff] to-white bg-clip-text text-shadow-sm text-shadow-white">Eficientemente</span></span> 
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-white/70 mb-8 max-w-lg"
          >
            De forma rápida, sencilla y sin complicaciones. Lleva el control total de tu inventario y optimiza tu gestión de stock con nuestra plataforma intuitiva y eficiente.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button variant="blanco" asChild>
              <Link href="/dashboard">Gestionar stock</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
