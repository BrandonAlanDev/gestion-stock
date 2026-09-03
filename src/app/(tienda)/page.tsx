import { getPageConfig } from "@/actions/page-config/general.actions";
import HomeClient from "@/components/home/HomeClient";
import type { ComponentProps } from "react";

export default async function HomePage() {
  const { pageConfig } = await getPageConfig();

  return (
    <HomeClient
      pageConfig={pageConfig as unknown as ComponentProps<typeof HomeClient>["pageConfig"]}
    />
  );
}
