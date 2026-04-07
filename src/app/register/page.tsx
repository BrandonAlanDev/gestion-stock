"use client";
import { registerAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { User, Mail, Lock, Rocket, Shirt } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(registerAction, { error: "", success: false });

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
    }
  }, [state.success, router]);

  return (
    <AuthLayout>
      <div className="min-w-[300px] md:min-w-[400px] backdrop-blur-lg bg-linear-to-br from-gray-950/60 to-gray-850/20 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/90 mb-4 border border-blue-500/30">
              <Shirt className="w-8 h-8 text-amber-300"/>
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Obtén tu <span className="text-amber-300">permiso</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Regístrate y espera la aprobacion de tu cuenta</p>
        </div>

        <div className="space-y-3 mb-6">
                  <GoogleButton />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-white px-3 text-gray-950 rounded-4xl">O mediante Email</span>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Input Nombre */}
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                <input
                  name="name"
                  type="text"
                  placeholder="Nombre Completo"
                  required
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                <input
                  name="email"
                  type="email"
                  placeholder="Correo de contacto"
                  required
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  required
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 transition-all"
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
            className="w-full bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 flex items-center justify-center gap-3 uppercase italic"
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
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            ¿Ya eres miembro?{" "}
            <Link href="/login" className="text-amber-500 font-black hover:text-amber-400 transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}