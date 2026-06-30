import { getDashboardStats } from "@/actions/graficas.actions";
import ChartWrapper from "@/components/ui/ChartsWrapper";

export default async function AdminPage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-12">
      {/* Elimina el max-w-7xl si quieres que el contenido se estire más */}
      <div className="w-full">
        <ChartWrapper stats={stats} />
      </div>
    </div>
  );
}