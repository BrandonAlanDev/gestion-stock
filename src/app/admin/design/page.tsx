import { getPageConfig } from "@/actions/page-config/general.actions";
import { getContrastColor } from "@/lib/utils";
import DesignPage from "@/components/admin/design/DesignPage";

export default async function DesignAdminPage() {
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
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4" style={{ color: primaryColor }}>
              <span className="w-2 h-10 rounded-full" style={{ backgroundColor: primaryColor }} />
              Diseño de Página
            </h1>
            <p className="ml-6 mt-2 text-[10px] uppercase tracking-[0.4em] font-black" style={{ color: textColor + "99" }}>
              Branding · Secciones · Carruseles
            </p>
          </div>
        </div>

        <DesignPage pageConfig={pageConfig} />
      </div>
    </div>
  );
}
