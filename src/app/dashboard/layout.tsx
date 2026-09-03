import LayoutGestion from "@/components/layout/LayoutGestion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <LayoutGestion>{children}</LayoutGestion>;
}
