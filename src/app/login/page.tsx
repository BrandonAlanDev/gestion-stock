"use client";
import { loginAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, ChevronRight,Shirt} from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(loginAction, { error: "", success: false });

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <AuthLayout>
      <div className="min-w-[300px] md:min-w-[400px] backdrop-blur-lg bg-linear-to-br from-gray-950/60 to-gray-850/20 border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        
        {/* Glow en el borde superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/90 mb-4 border border-amber-500/30">
            <Shirt className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Gestion <span className="text-amber-300">OK</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Ingresa a tu cuenta</p>
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

        <form action={action} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500 uppercase ml-1 tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                name="email" 
                type="email" 
                placeholder="vendedor@ok.com"
                required 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500 uppercase ml-1 tracking-widest">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {state.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center animate-shake">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full group relative bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl transition-all overflow-hidden active:scale-[0.98] disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-tighter text-lg">
              {isPending ? "Iniciando..." : "Iniciar Sesión"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Efecto de brillo al pasar el mouse */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          ¿No tienes cuenta? <Link href="/register" className="text-amber-400 hover:text-amber-300 font-bold underline-offset-4 hover:underline">Registrarse</Link>
        </p>
      </div>
    </AuthLayout>
  );
}