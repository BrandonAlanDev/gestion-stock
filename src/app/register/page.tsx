"use client";
import { registrarUsuario } from "@/actions/sesion/registrar-usuario";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { User, Mail, Lock, Rocket, Shirt } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(registrarUsuario, { error: "", success: false });
  const {pageConfig} = usePageConfig();
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
    }
  }, [state.success, router]);

  return (
    <AuthLayout>
      <div className="min-w-[300px] md:min-w-[400px] backdrop-blur-lg bg-[linear-gradient(to_bottom_right,color-mix(in_srgb,var(--color-fondo-sitio)_60%,transparent),color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent))] border border-[color-mix(in_srgb,var(--texto-sobre-fondo)_10%,transparent)] rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${pageConfig?.logo ? '' : 'bg-[color-mix(in_srgb,var(--color-fondo-sitio)_80%,transparent)] border border-[color-mix(in_srgb,var(--color-primario)_20%,transparent)] '} mb-4`}>
              {typeof pageConfig?.logo === "string" && pageConfig.logo ? (
                <Image src={pageConfig.logo} alt="Logo" width={32} height={32} unoptimized />
              ):(
                <Shirt className="w-8 h-8 text-[var(--color-primario)]"
              />
              )}
          </div>
          <h1 className="text-3xl font-black text-[var(--texto-sobre-fondo)] italic uppercase tracking-tighter">
            Obtén tu <span className="text-[var(--color-primario)]"
            >permiso</span>
          </h1>
          <p className="text-[var(--texto-sobre-fondo)]/70 text-sm mt-1">Regístrate y espera la aprobacion de tu cuenta</p>
        </div>

        <div className="space-y-3 mb-6">
                  <GoogleButton />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[color-mix(in_srgb,var(--texto-sobre-fondo)_10%,transparent)]" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-[var(--color-primario)] px-3 text-[var(--texto-sobre-primario)] rounded-4xl">O mediante Email</span>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Input Nombre */}
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primario)]/50" 
                />
                <input
                  name="name"
                  type="text"
                  placeholder="Nombre Completo"
                  required
                  className="w-full bg-[color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl py-3 pl-10 pr-4 text-[var(--texto-sobre-fondo)] focus:border-[var(--color-primario)] transition-all"
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primario)]/50" 
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Correo de contacto"
                  required
                  className="w-full bg-[color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl py-3 pl-10 pr-4 text-[var(--texto-sobre-fondo)] focus:border-[var(--color-primario)] transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primario)]/50" 
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  required
                  className="w-full bg-[color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl py-3 pl-10 pr-4 text-[var(--texto-sobre-fondo)] focus:border-[var(--color-primario)] transition-all"
                />
              </div>
            </div>
          </div>

          {state.error && (
            <p className="text-red-400 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="w-full font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.25)] transition-all duration-300 flex items-center justify-center gap-3 uppercase italic hover:cursor-pointer"
            style={{
              background: hover
                ? "linear-gradient(to right, color-mix(in srgb, var(--color-primario) 94%, black), color-mix(in srgb, var(--color-primario) 82%, white))"
                : "linear-gradient(to right, color-mix(in srgb, var(--color-primario) 88%, black), color-mix(in srgb, var(--color-primario) 88%, white))",
              color: "var(--texto-sobre-primario)",
            }}
          >
            {isPending ? "Procesando..." : (
              <>
                <Rocket className="w-5 h-5" />
                ¡Registrarme!
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-[var(--texto-sobre-fondo)]/50 uppercase tracking-widest">
            ¿Ya eres miembro?{" "}
            <Link href="/login" className="text-[var(--color-primario)] font-black hover:opacity-80 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
