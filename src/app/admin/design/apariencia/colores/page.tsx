import { getPageConfig } from "@/actions/page-config/general.actions";
import SeccionColores from "@/components/admin/diseno/apariencia/SeccionColores";
import { normalizarConfigApariencia } from "@/lib/apariencia/normalizar-config-apariencia";

export default async function ColoresPage() {
  const resultado = await getPageConfig();
  const config = normalizarConfigApariencia(
    resultado.ok ? resultado.pageConfig ?? null : null
  );
  return <SeccionColores config={config} />;
}
