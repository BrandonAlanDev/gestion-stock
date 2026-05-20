"use client";

import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, ChevronRight, Waves } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsPending(false);

    if (result?.error) {
      setError("Credenciales incorrectas");
      return;
    }

    router.refresh();
    router.push("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="min-w-[300px] md:min-w-[400px] backdrop-blur-lg bg-gradient-to-br from-neutral-950/80 to-neutral-900/40 border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">

        {/* Línea superior cyan */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

        {/* Glows decorativos */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black/60 border border-cyan-500/20 mb-5">
            <Waves className="w-7 h-7 text-cyan-400" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
            New<span className="text-cyan-400">Surf</span>Board
          </h1>

          <p className="text-neutral-500 text-sm mt-2 font-light">
            Ingresá a tu cuenta
          </p>
        </div>

        {/* Google */}
        <div className="mb-6">
          <GoogleButton />
        </div>

        {/* Separador */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
            <span className="bg-neutral-950 px-3 text-neutral-600 rounded-full">
              O con email
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full group bg-white hover:bg-cyan-400 text-black font-black py-4 rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <span className="flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
              {isPending ? "Ingresando..." : "Iniciar Sesión"}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600 mt-8">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline transition-colors"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}