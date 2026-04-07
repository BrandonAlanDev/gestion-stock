"use client";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-500">
      <div className="relative flex flex-col items-center justify-center w-56 py-8 px-4 bg-white rounded-3xl shadow-2xl border border-white/60">
        
        {/* Contenedor de la Rueda */}
        <div className="relative flex items-center justify-center">
          
          {/* Sombra de piso estática */}
          <div className="absolute -bottom-4 w-16 h-1.5 bg-black/20 rounded-[100%] blur-[2px]"></div>

          {/* === RUEDA QUE GIRA === */}
          <div className="w-24 h-24 rounded-full relative animate-spin [animation-duration:1.5s] shadow-xl">
            
            {/* 1. Neumático (Goma exterior negra) */}
            <div className="absolute inset-0 rounded-full bg-slate-800 shadow-sm border-4 border-slate-800"></div>
            
            {/* 2. Banda blanca fina (detalle estético deportivo) */}
            <div className="absolute inset-1 rounded-full border-2 border-white/20"></div>

            {/* 3. Llanta (Metal interior) */}
            <div className="absolute inset-2 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
              
              {/* 4. RAYOS GEOMÉTRICOS (SVG) */}
              <svg className="w-full h-full text-slate-500" viewBox="0 0 100 100">
                {/* Definimos un grupo centrado */}
                <g stroke="currentColor" strokeWidth="8" strokeLinecap="butt">
                  {/* Cruz Vertical y Horizontal (+) */}
                  <line x1="50" y1="0" x2="50" y2="100" /> {/* Arriba a Abajo */}
                  <line x1="0" y1="50" x2="100" y2="50" /> {/* Izquierda a Derecha */}
                  
                  {/* Cruz Diagonal (X) */}
                  <line x1="15" y1="15" x2="85" y2="85" /> {/* Diagonal 1 */}
                  <line x1="85" y1="15" x2="15" y2="85" /> {/* Diagonal 2 */}
                </g>

                {/* Círculos decorativos internos para dar profundidad */}
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                
                {/* Tapa Cubrebulones Central */}
                <circle cx="50" cy="50" r="14" className="text-slate-700" fill="currentColor" />
                <circle cx="50" cy="50" r="4" className="text-blue-500" fill="currentColor" />
              </svg>
            </div>
            
            {/* 5. Brillo superior (Reflejo metálico estático sobre la rueda girando) */}
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-transparent via-white/30 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Textos */}
        <div className="mt-6 text-center space-y-1">
          <h3 className="text-sm font-black text-slate-700 tracking-widest uppercase animate-pulse">
            Procesando
          </h3>
          <p className="text-[11px] font-medium text-slate-400">
            Aguarde un momento...
          </p>
        </div>
      </div>
    </div>
  );
}