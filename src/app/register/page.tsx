"use client";
import { registerAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { User, Mail, Lock, Rocket, Shirt } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}
function adjustColor(hex: string, percent: number) {
  let color = hex.replace("#", "");

  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.max(0, r + (255 * percent) / 100));
  g = Math.min(255, Math.max(0, g + (255 * percent) / 100));
  b = Math.min(255, Math.max(0, b + (255 * percent) / 100));

  return `#${[r, g, b]
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(registerAction, { error: "", success: false });
  const {pageConfig} = usePageConfig();
  const [hover, setHover] = useState(false);
  const primary = pageConfig?.primaryColor || "#f59e0b";
  const darker = adjustColor(primary, -12);
  const lighter = adjustColor(primary, 12);
  const hoverDarker = adjustColor(primary, -6);
  const hoverLighter = adjustColor(primary, 18);

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
    }
  }, [state.success, router]);

  return (
    <AuthLayout>
      <div className="min-w-[300px] md:min-w-[400px] backdrop-blur-lg bg-linear-to-br from-gray-950/60 to-gray-850/20 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${pageConfig?.logo ? '' : 'bg-black/80 border border-blue-500/30 '} mb-4`}>
              {pageConfig?.logo? (
                <img src={pageConfig.logo} alt="Logo" width={32} height={32} />
              ):(
                <Shirt className="w-8 h-8 text-amber-300"
                style={{ color: pageConfig?.primaryColor }}
              />
              )}
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Obtén tu <span className="text-amber-300"
            style={{ color: pageConfig?.primaryColor }}
            >permiso</span>
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
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" 
                style={{ color: pageConfig?.primaryColor }}
                />
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" 
                style={{ color: pageConfig?.primaryColor }}
                />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" 
                  style={{ color: pageConfig?.primaryColor }}
                />
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
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="w-full text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.25)] transition-all duration-300 flex items-center justify-center gap-3 uppercase italic hover:cursor-pointer"
            style={{
              background: hover
                ? `linear-gradient(to right, ${hoverDarker}, ${hoverLighter})`
                : `linear-gradient(to right, ${darker}, ${lighter})`,
              color: getContrastColor(primary),
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
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            ¿Ya eres miembro?{" "}
            <Link href="/login" className="text-amber-500 font-black hover:text-amber-400 transition-colors"
              style={{ color: pageConfig?.primaryColor }}
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}