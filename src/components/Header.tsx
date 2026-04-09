"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, Menu, X, Shirt, UserCircle, Truck } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg bg-linear-to-br from-black to-black/60 shadow-md w-full max-w-dvw max-h-dvh text-white !hover:text-amber-300"
      >
        <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
          
          <Link href="/#home" className="flex items-center justify-center gap-2">
            <Shirt className="w-8 h-8 text-amber-300" />
            <span className="block sm:hidden lg:block text-xl font-semibold">
              Gestion{" "}<span className="text-amber-300 font-bold">OK</span>
            </span>
          </Link>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link href="/dashboard" className="text-md font-bold hover:text-amber-300 transition-colors duration-300">
              Productos
            </Link>
            <Link href="/dashboard/categories" className="text-md font-bold hover:text-amber-300 transition-colors duration-300">
              Categorias
            </Link>
            {/* TEXTO ACTUALIZADO AQUÍ */}
            <Link href="/provider" className="text-md font-bold hover:text-amber-300 transition-colors duration-300">
              Proveedores
            </Link>
          </nav>

          {/* ACCIONES DE USUARIO DESKTOP */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link className="flex flex-row items-center gap-2 text-md font-bold hover:text-amber-300 transition-colors duration-300" href="/dashboard">
                  <UserCircle className="text-white" width={'32'} height={'32'}/>
                  {session?.user?.name || "Mi Perfil"}
                </Link>
                <form action={handleSignOut}>
                  <Button variant="blanco" size="sm" type="submit">Salir</Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button variant="blanco" size="sm">
                  <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>

          {/* BOTON HAMBURGUESA MOBILE */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* SIDEBAR MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 z-[998] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 w-[280px] h-screen bg-black text-white z-[999] shadow-xl flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-semibold text-amber-300">
                  Menú
                </span>
                <button onClick={closeMenu} className="p-2 -mr-2">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <nav className="flex flex-col gap-4 overflow-y-auto mb-6 flex-1 bg-black">
                <Link href="/dashboard" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start border-neutral-800">Panel de productos</Button>
                </Link>
                <Link href="/dashboard/categories" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start border-neutral-800">Categorias</Button>
                </Link>
                {/* TEXTO ACTUALIZADO EN MOBILE TAMBIÉN */}
                <Link href="/dashboard/providers" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start border-neutral-800">
                    <Truck className="w-4 h-4 mr-2" /> Proveedores
                  </Button>
                </Link>
              </nav>

              <div className="mt-auto border-t border-neutral-800 pt-6 flex flex-col gap-4 pb-4">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-3">
                      <UserCircle className="text-white" width={'40'} height={'40'}/>
                      <span className="font-medium text-sm truncate">{session?.user?.name || "Mi Perfil"}</span>
                    </Link>
                    <form action={handleSignOut} onSubmit={closeMenu}>
                      <Button variant="blanco" className="w-full" type="submit">Salir</Button>
                    </form>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="blanco" className="w-full">
                      <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}