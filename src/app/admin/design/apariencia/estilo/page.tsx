import { getPageConfig } from "@/actions/page-config/general.actions";
import SeccionEstilo from "@/components/admin/diseno/apariencia/SeccionEstilo";
import { normalizarConfigApariencia } from "@/lib/apariencia/normalizar-config-apariencia";

export default async function EstiloPage() {
  const resultado = await getPageConfig();
  const config = normalizarConfigApariencia(
    resultado.ok ? resultado.pageConfig ?? null : null
  );
  return <SeccionEstilo config={config} />;
}
