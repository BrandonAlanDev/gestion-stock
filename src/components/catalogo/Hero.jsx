import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { heroSlides } from './data';


const Hero = ({ setActiveCategory }) => {
  const [current, setCurrent] = useState(0);

  // Lógica de Autoplay
  useEffect(() => {
    // Usamos setTimeout en lugar de setInterval para tener más control y que no se ejecute en paralelo
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // 6 segundos

    // IMPORTANTE: Esta función de limpieza se ejecuta CADA VEZ que 
    // 'current' cambia (ya sea automático o manual) o si el componente se desmonta.
    // Esto mata el timer anterior y permite que se cree uno nuevo desde 0.
    return () => clearTimeout(timer);
  }, [current]); // Dependencia: [current]

  // Handlers Manuales
  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Función para ir a un slide específico (dots)
  const handleDotClick = (index) => {
    setCurrent(index);
  };

  const handleHeroCta = (category) => {
    setActiveCategory(category);
    // Scroll suave hacia la sección de destacados
    const section = document.getElementById('featured');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentSlide = heroSlides[current];

  return (
    <div className="relative w-full h-[100dvh] bg-[#0a0a0a] text-white overflow-hidden group">
      
      {/* Carrusel de Imágenes */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
          
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            src={currentSlide.image} 
            alt={currentSlide.title} 
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>
      </AnimatePresence>

      {/* Contenido de Texto */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex items-center">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={currentSlide.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl space-y-6"
          >
            <span className="inline-block py-1 px-3 border border-white/20 rounded-full text-xs font-medium backdrop-blur-sm text-cyan-300">
              {currentSlide.subtitle}
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              {currentSlide.title}
            </h1>
            
            <p className="text-lg text-gray-300 font-light leading-relaxed">
              {currentSlide.description}
            </p>
            
            <div className="flex gap-4 pt-4">
              <a href={`#products`} >
                <button 
                  onClick={() => handleHeroCta(currentSlide.targetCategory)}
                  className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 group shadow-lg shadow-white/10"
                  >
                  {currentSlide.ctaText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles de Navegación (Flechas) */}
      <div className="absolute bottom-8 right-8 z-30 flex gap-2">
        <button 
          onClick={handlePrev}
          className="p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNext}
          className="p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all active:scale-90"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicadores (Dots) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => handleDotClick(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
        ))}
      </div>
    </div>
  );
};
export default Hero;