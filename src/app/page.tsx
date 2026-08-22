import { getPageConfig } from "@/actions/page-config/general.actions";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const { pageConfig } = await getPageConfig();

  return <HomeClient pageConfig={pageConfig} />;
}