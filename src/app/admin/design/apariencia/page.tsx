import { getPageConfig } from "@/actions/page-config/general.actions";
import EditorApariencia from "@/components/admin/diseno/apariencia/EditorApariencia";

export default async function AparienciaPage() {
  const resultado = await getPageConfig();
  const pageConfig = resultado.ok ? resultado.pageConfig ?? null : null;

  return <EditorApariencia config={pageConfig} />;
}
