import {getPageConfig} from "@/actions/page-config/general.actions";
import {clearPageConfig} from "@/actions/page-config/maintenance.actions";

import PageConfigForm from "@/components/admin/page-config/PageConfigForm";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}


export default async function PageConfigPage() {
  const { pageConfig } = await getPageConfig();
  console.log(pageConfig);

  return (

    <div className=" md:ml-60 p-6 sm:p-8 w-full mt-18 transition-colors duration-200"
    style={{ backgroundColor: getContrastColor(getContrastColor(pageConfig?.secondaryColor || "black")) ,
    color:getContrastColor(pageConfig?.secondaryColor || "black"),
    borderColor:getContrastColor(pageConfig?.secondaryColor || "black")
    }}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>

            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4" style={{ color: pageConfig?.primaryColor || "black" }} >
              <span className="w-2 h-10 rounded-full" style={{ backgroundColor: pageConfig?.primaryColor || "black" }} />
              Configuración de Página
            </h1>

            <p className="ml-6 mt-2 text-[10px] uppercase tracking-[0.4em] font-black text-neutral-500"style={{ color: getContrastColor(pageConfig?.secondaryColor || "white") }} >
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

        <PageConfigForm config={pageConfig} />
      </div>
    </div>
  );
}