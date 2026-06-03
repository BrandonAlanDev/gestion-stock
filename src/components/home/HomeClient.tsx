"use client";

import ProductLayout from "@/components/products/layouts/ProductLayout";

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-blue-50 overflow-x-hidden max-w-full">
      
      <main>
        <ProductLayout />
      </main>

    </div>
  );
}