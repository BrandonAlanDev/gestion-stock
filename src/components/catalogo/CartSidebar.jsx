import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';


const CartSidebar = ({ isOpen, onClose, cartItems, updateQty, removeItem }) => {
  
  // --- FUNCIÓN DE LIMPIEZA DE DATOS ---
  // Convierte "$1.500" o "1500" en el número 1500
  const parsePrice = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[^0-9.-]+/g, "")) || 0;
  };

  // --- LÓGICA DE PRECIOS SIN NaN ---
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = parsePrice(item.price);
      return acc + (price * item.qty);
    }, 0);
  }, [cartItems]);

  const shippingTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    
    const costs = cartItems.map(item => {
      const text = item.shipping?.toLowerCase() || "";
      if (text.includes('gratis')) return 0;
      const match = text.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    
    return Math.max(...costs);
  }, [cartItems]);

  const total = subtotal + shippingTotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Carrito
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-tight">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.shipping}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border rounded-lg px-2 py-1 gap-3">
                          <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-black">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-black">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold">
                          ${(parsePrice(item.price) * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Totales */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-gray-50 border-t space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shippingTotal === 0 ? "text-green-600 font-bold" : ""}>
                    {shippingTotal === 0 ? "Gratis" : `$${shippingTotal.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <Link 
                  href="/paycart" 
                  onClick={onClose}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  Ir a pagar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;