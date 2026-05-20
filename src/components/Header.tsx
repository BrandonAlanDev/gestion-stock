"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Package,
  Tags,
  Truck,
  Ruler,
  LogOut,
  Menu,
  X,
  User,
  History,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

// Links exclusivos del panel de administración
const enlacesAdmin = [
  { href: "/dashboard",  label: "Productos",   icono: Package },
  { href: "/categories", label: "Categorías",  icono: Tags    },
  { href: "/provider",   label: "Proveedores", icono: Truck   },
  { href: "/sizes",      label: "Talles",      icono: Ruler   },
  { href: "/movements",  label: "Historial",   icono: History },
];

export default function Header({ cartCount, onOpenCart }: HeaderProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const [menuAdminAbierto, setMenuAdminAbierto] = useState(false);
  const [chipAbierto,      setChipAbierto]      = useState(false);
  const [scrolled,         setScrolled]         = useState(false);

  const refChip = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const esAdmin = session?.user?.role === "ADMIN";

  // Detectar scroll
  useEffect(() => {
    const alScrollear = () => setScrolled(window.scrollY > 0);
    alScrollear();
    window.addEventListener("scroll", alScrollear);
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  // Cerrar chip al hacer click fuera
  useEffect(() => {
    const alClickearAfuera = (e: MouseEvent) => {
      if (refChip.current && !refChip.current.contains(e.target as Node)) {
        setChipAbierto(false);
      }
    };
    document.addEventListener("mousedown", alClickearAfuera);
    return () => document.removeEventListener("mousedown", alClickearAfuera);
  }, []);

  const handleCerrarSesion = async () => {
    setChipAbierto(false);
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  if (status === "loading") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-transparent">

      {/* Barra principal */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-lg bg-teal-500/15 border border-teal-400/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 12 Q6 6 12 12 Q18 18 22 12" />
            </svg>
          </div>
          <span className="text-[16px] font-medium text-white tracking-tight">
            New<span className="text-teal-400">Surf</span>Board
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-2">

          {/* Sin sesión: solo botón login */}
          {!session?.user && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-transparent border border-white/30 hover:border-teal-400/60 hover:text-teal-300 transition-all duration-200"
            >
              <User size={15} className="text-teal-400" />
              Iniciar sesión
            </Link>
          )}

          {/* Admin logueado: chip + hamburguesa */}
          {esAdmin && (
            <>
              {/* Chip usuario con dropdown */}
              <div className="relative" ref={refChip}>
                <button
                  onClick={() => setChipAbierto((v) => !v)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 border transition-all duration-200 text-white
                    bg-transparent border-white/30
                    hover:border-teal-400/60 hover:text-teal-300
                    ${chipAbierto ? "rounded-t-[10px] rounded-b-none" : "rounded-[10px]"}
                  `}
                >
                  <div className="w-7 h-7 rounded-full bg-transparent border border-teal-400/40 flex items-center justify-center text-[11px] font-medium text-teal-300 flex-shrink-0">
                    {session?.user?.name?.[0]?.toUpperCase() ?? <User size={12} />}
                  </div>

                  <span className="text-sm font-medium text-white hidden sm:block">
                    {session?.user?.name}
                  </span>

                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-teal-300 bg-transparent border border-teal-400/30 rounded-md px-2 py-0.5">
                    <ShieldCheck size={11} />
                    Admin
                  </span>

                  <ChevronDown
                    size={14}
                    className={`text-white/40 transition-transform duration-200 ${chipAbierto ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown cerrar sesión — este sí necesita fondo para ser legible */}
                {chipAbierto && (
                  <div className="absolute right-0 top-full w-full min-w-[160px] bg-black/70 backdrop-blur-sm border border-white/15 border-t-0 rounded-b-[10px] overflow-hidden z-10">
                    <button
                      onClick={handleCerrarSesion}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 transition-all duration-150"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>

              {/* Botón hamburguesa — solo admin */}
              <button
                onClick={() => setMenuAdminAbierto((v) => !v)}
                className="flex items-center p-2 rounded-xl border transition-all duration-200 bg-transparent border-white/30 text-white hover:border-teal-400/60 hover:text-teal-300"
              >
                {menuAdminAbierto ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Panel admin desplegable — completamente transparente */}
      {esAdmin && menuAdminAbierto && (
        <div className="bg-transparent border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-3">
              Panel admin
            </p>
            <nav className="flex flex-wrap gap-2">
              {enlacesAdmin.map(({ href, label, icono: Icono }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAdminAbierto(false)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-150
                    ${pathname === href
                      ? "text-teal-300 border-teal-400/40"
                      : "text-white/70 border-white/20 hover:text-teal-300 hover:border-teal-400/40"
                    }
                  `}
                >
                  <Icono size={15} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}