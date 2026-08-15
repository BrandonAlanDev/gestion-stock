import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";
import { PageConfigProvider } from "@/components/providers/PageConfigProvider";
import ProveedorColoresAdmin from "@/components/providers/ProveedorColoresAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // Asegura que el registro PageConfig id=1 exista
  await getOrCreatePageConfig();
  const result = await getPageConfig();
  const pageConfig = result?.pageConfig ?? {};

  return (
    <PageConfigProvider pageConfig={{ ok: true, pageConfig }}>
      <ProveedorColoresAdmin>{children}</ProveedorColoresAdmin>
    </PageConfigProvider>
  );
}