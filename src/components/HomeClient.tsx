"use client";

import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import ProductLayout from "./catalogo/ProductLayout";

export default function HomeClient() {

  return (
      <div className="min-h-screenjustify-center items-center mx-auto bg-blue-50 overflow-hidden max-w-dvw">
        <main>
          <ProductLayout/>
        </main>
      </div>
  );
}
