import { getPageConfig } from "@/actions/page-config/general.actions";
import { getContrastColor } from "@/lib/utils";
import { clearPageConfig } from "@/actions/page-config/maintenance.actions";
import PageConfigForm from "@/components/admin/page-config/PageConfigForm";

export default async function PageConfigPage() {
  const { pageConfig } = await getPageConfig();

  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

  return (
    <div
      className="p-6 sm:p-8 w-full transition-colors duration-200"
      style={{
        backgroundColor: textColor === "#ffffff" ? "#0a0a0a" : "#ffffff",
        color: textColor,
      }}
    >
      <div className="max-w-7xl mx-auto my-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4" style={{ color: primaryColor }}>
              <span className="w-2 h-10 rounded-full" style={{ backgroundColor: primaryColor }} />
              Configuración de Página
            </h1>
            <p className="ml-6 mt-2 text-[10px] uppercase tracking-[0.4em] font-black" style={{ color: textColor + "99" }}>
              Branding · Ecommerce · SEO · Redes Sociales
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await clearPageConfig();
            }}
          >
            <button className="px-6 py-3 rounded-[1.0rem] bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all">
              Resetear Configuración
            </button>
          </form>
        </div>

        <PageConfigForm />
      </div>
    </div>
  );
}
