import { getPageConfig } from "@/actions/page-config/general.actions";
import SeccionIdentidad from "@/components/admin/diseno/apariencia/SeccionIdentidad";
import { normalizarConfigApariencia } from "@/lib/apariencia/normalizar-config-apariencia";

export default async function AparienciaPage() {
  const resultado = await getPageConfig();
  const config = normalizarConfigApariencia(
    resultado.ok ? resultado.pageConfig ?? null : null
  );
  return <SeccionIdentidad config={config} />;
}
