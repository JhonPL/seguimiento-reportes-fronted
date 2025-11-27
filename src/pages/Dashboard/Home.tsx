import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";

// Componentes del dashboard (puedes reemplazarlos luego por los reales)
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-700 dark:text-gray-300">
        No autorizado. Inicie sesión nuevamente.
      </div>
    );
  }

  const { role } = user;

  return (
    <>
      <PageMeta title={`Panel ${role}`} description={`Vista personalizada para ${role}`} />
      {/*RESPONSABLE DE REPORTE */}
      {role === "administrador" && (
        <div className="space-y-6">

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
              <EcommerceMetrics />
              <MonthlySalesChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
              <MonthlyTarget />
            </div>

            <div className="col-span-12">
              <StatisticsChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>

            <div className="col-span-12 xl:col-span-7">
              <RecentOrders />
            </div>
          </div>
        </div>
      )}

      {/*RESPONSABLE DE REPORTE */}
      {role === "responsable" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Mi Dashboard de Reportes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aquí puedes ver tus reportes asignados, subir evidencia y marcar envíos.
          </p>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-8">
              <EcommerceMetrics />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <MonthlyTarget />
            </div>
          </div>
        </div>
      )}

      {/* 🔹 SUPERVISOR */}
      {role === "supervisor" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Panel del Supervisor</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Supervisa los reportes de tus responsables, genera alertas y valida envíos.
          </p>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-6">
              <StatisticsChart />
            </div>
            <div className="col-span-12 xl:col-span-6">
              <RecentOrders />
            </div>
          </div>
        </div>
      )}

      {/* 🔹 AUDITOR */}
      {role === "auditor" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Panel de Auditoría</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consulta históricos, descargas de evidencia y métricas avanzadas.
          </p>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-12">
              <StatisticsChart />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
