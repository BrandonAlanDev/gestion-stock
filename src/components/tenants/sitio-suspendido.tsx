import { Ban } from "lucide-react";

interface PropiedadesSitioSuspendido {
  nombre?: string;
}

export function SitioSuspendido({ nombre }: PropiedadesSitioSuspendido) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <Ban aria-hidden="true" className="size-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sitio temporalmente suspendido
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {nombre ? `${nombre} no está disponible` : "Este sitio no está disponible"}
          {" en este momento. Comunicate con el administrador del servicio para obtener más información."}
        </p>
      </section>
    </main>
  );
}
