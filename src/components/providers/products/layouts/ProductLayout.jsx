"use client";
import { useState, useEffect } from 'react';
import { products } from '@/components/data/data';
import FeaturedSection from '@/components/home/FeaturedSection';
import Hero from '@/components/layout/Hero';
import CartSidebar from '@/components/cart/CartSidebar';


function ProductLayout() {
  const [homeCategory, setHomeCategory] = useState("Todos");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- LÓGICA DE LOCALSTORAGE ---

  // 1. Inicializar el estado directamente desde LocalStorage si existe
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const guardado = localStorage.getItem('tech_cart');
    if (guardado) setCartItems(JSON.parse(guardado));
  }, []);

  // 2. useEffect para guardar automáticamente cuando cartItems cambie
  useEffect(() => {
    localStorage.setItem('tech_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const itemExists = prevItems.find(item => item.id === product.id);
      if (itemExists) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id, delta) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col m-0 p-0">
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQty={handleUpdateQty}
        removeItem={handleRemoveItem}
      />

      <main className="flex-grow">
        {/* RUTA HOME */}
        <>
          {/* El Hero controla la categoría de la FeaturedSection */}
          <Hero setActiveCategory={setHomeCategory} />

          {/* FeaturedSection recibe el estado y la función para cambiarlo */}
          <FeaturedSection
            activeCategory={homeCategory}
            setActiveCategory={setHomeCategory}
            products={products}
            addToCart={handleAddToCart}
          />
        </>
      </main>

      <footer className="border-t-2 border-gray-50">
        {/* <LocationSection /> */}
      </footer>
    </div>
  );
}

export default ProductLayout;