import { getPageConfig } from "@/actions/page-config/general.actions";
import SeccionTipografia from "@/components/admin/diseno/apariencia/SeccionTipografia";
import { normalizarConfigApariencia } from "@/lib/apariencia/normalizar-config-apariencia";

export default async function TipografiaPage() {
  const resultado = await getPageConfig();
  const config = normalizarConfigApariencia(
    resultado.ok ? resultado.pageConfig ?? null : null
  );
  return <SeccionTipografia config={config} />;
}
