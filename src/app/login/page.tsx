"use client";

import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, ChevronRight, Shirt } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { pageConfig } = usePageConfig();
  const [hover, setHover] = useState(false);

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
      <div className="min-w-[300px] md:min-w-[400px] backdrop-blur-lg bg-[linear-gradient(to_bottom_right,color-mix(in_srgb,var(--color-fondo-sitio)_60%,transparent),color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent))] border border-[color-mix(in_srgb,var(--texto-sobre-fondo)_10%,transparent)] rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${pageConfig?.logo ? '' : 'bg-[color-mix(in_srgb,var(--color-fondo-sitio)_80%,transparent)] border border-[color-mix(in_srgb,var(--color-primario)_20%,transparent)] '} mb-4`}>
            {typeof pageConfig?.logo === "string" && pageConfig.logo ? (
              <Image src={pageConfig.logo} alt="Logo" width={32} height={32} unoptimized />
            ) : (
              <Shirt
                className="w-8 h-8 text-[var(--color-primario)]"
              />
            )}
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            {(typeof pageConfig?.storeName === "string" ? pageConfig.storeName : "Gestion OK").split(" ").map((word: string, index: number) => (
              index % 2 !== 0 ? (
                <span key={index} className="text-[var(--color-primario)]">
                  {word}{" "}
                </span>
              ) : (
                <span className="text-[var(--texto-sobre-fondo)]" key={index}>
                  {word}{" "}
                </span>
              )
            ))}
          </h1>
          <p className="text-[var(--texto-sobre-fondo)]/70 text-sm mt-1">Ingresá a tu cuenta</p>
        </div>

        <div className="space-y-3 mb-6">
          <GoogleButton />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[color-mix(in_srgb,var(--texto-sobre-fondo)_10%,transparent)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-[var(--color-primario)] px-3 text-[var(--texto-sobre-primario)] rounded-4xl">O con email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Input Email */}
            <div className="space-y-1">
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primario)]/50"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-[color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl py-3 pl-10 pr-4 text-[var(--texto-sobre-fondo)] focus:border-[var(--color-primario)] transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primario)]/50"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-[color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl py-3 pl-10 pr-4 text-[var(--texto-sobre-fondo)] focus:border-[var(--color-primario)] transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
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
            {isPending ? "Ingresando..." : (
              <>
                <ChevronRight className="w-5 h-5" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-[var(--texto-sobre-fondo)]/50 uppercase tracking-widest">
            ¿No tenés cuenta?{" "}
            <Link
              href="/register"
              className="text-[var(--color-primario)] font-black hover:opacity-80 transition-colors"
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
