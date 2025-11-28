import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import estadisticasService, { EstadisticasDTO } from "../../services/estadisticasService";
import MetricasReportes from "../../components/dashboard/MetricasReportes";
import CumplimientoChart from "../../components/dashboard/CumplimientoChart";
import ProximosVencerTable from "../../components/dashboard/ProximosVencerTable";
import VencidosTable from "../../components/dashboard/VencidosTable";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasDTO | null>(null);
  const [proximosVencer, setProximosVencer] = useState<any[]>([]);
  const [vencidos, setVencidos] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, proximos, vencidosData] = await Promise.all([
        estadisticasService.obtenerDashboard(),
        estadisticasService.obtenerProximosVencer(7),
        estadisticasService.obtenerVencidos(),
      ]);
      
      setEstadisticas(stats);
      setProximosVencer(proximos.reportes || []);
      setVencidos(vencidosData.reportes || []);
    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setError("Error al cargar el dashboard. Verifique que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-700 dark:text-gray-300">
        No autorizado. Inicie sesión nuevamente.
      </div>
    );
  }

  const { role } = user;

  // Loading state
  if (loading) {
    return (
      <>
        <PageMeta title={`Dashboard - ${role}`} description="Panel de control" />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600 dark:text-gray-400">Cargando dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageMeta title="Dashboard" description="Panel de control" />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`Dashboard - ${role}`} description={`Vista personalizada para ${role}`} />
      
      {/* ADMINISTRADOR */}
      {role === "administrador" && estadisticas && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Dashboard Global
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Bienvenido, {user.nombre}. Resumen general de obligaciones.
              </p>
            </div>
            <button
              onClick={cargarDatos}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          {/* Métricas principales */}
          <MetricasReportes
            totalObligaciones={estadisticas.totalObligaciones}
            totalEnviadosATiempo={estadisticas.totalEnviadosATiempo}
            totalVencidos={estadisticas.totalVencidos}
            totalPendientes={estadisticas.totalPendientes}
            porcentajeCumplimiento={estadisticas.porcentajeCumplimientoATiempo || 0}
            reportesProximos7Dias={estadisticas.reportesProximosVencer7Dias}
          />

          {/* Segunda fila: Gráfico de cumplimiento + Próximos a vencer */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-5">
              <CumplimientoChart
                porcentaje={estadisticas.porcentajeCumplimientoATiempo || 0}
                entidadProblema={estadisticas.entidadMayorIncumplimiento}
                incumplimientosEntidad={estadisticas.incumplimientosEntidadProblema}
                responsableProblema={estadisticas.responsableMayorIncumplimiento}
                incumplimientosResponsable={estadisticas.incumplimientosResponsableProblema}
              />
            </div>

            <div className="col-span-12 xl:col-span-7">
              <ProximosVencerTable
                reportes={proximosVencer}
                onVerTodos={() => navigate("/calendar")}
              />
            </div>
          </div>

          {/* Tercera fila: Reportes vencidos */}
          {vencidos.length > 0 && (
            <VencidosTable
              reportes={vencidos}
              onVerTodos={() => navigate("/reportes")}
            />
          )}
        </div>
      )}

      {/* RESPONSABLE */}
      {role === "responsable" && estadisticas && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Mi Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Bienvenido, {user.nombre}. Aquí puedes ver tus reportes asignados.
            </p>
          </div>

          <MetricasReportes
            totalObligaciones={estadisticas.totalObligaciones}
            totalEnviadosATiempo={estadisticas.totalEnviadosATiempo}
            totalVencidos={estadisticas.totalVencidos}
            totalPendientes={estadisticas.totalPendientes}
            porcentajeCumplimiento={estadisticas.porcentajeCumplimientoATiempo || 0}
            reportesProximos7Dias={estadisticas.reportesProximosVencer7Dias}
          />

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-5">
              <CumplimientoChart
                porcentaje={estadisticas.porcentajeCumplimientoATiempo || 0}
              />
            </div>
            <div className="col-span-12 xl:col-span-7">
              <ProximosVencerTable
                reportes={proximosVencer}
                onVerTodos={() => navigate("/calendar")}
              />
            </div>
          </div>
        </div>
      )}

      {/* SUPERVISOR */}
      {role === "supervisor" && estadisticas && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Panel del Supervisor
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Bienvenido, {user.nombre}. Supervisa los reportes de tus responsables.
            </p>
          </div>

          <MetricasReportes
            totalObligaciones={estadisticas.totalObligaciones}
            totalEnviadosATiempo={estadisticas.totalEnviadosATiempo}
            totalVencidos={estadisticas.totalVencidos}
            totalPendientes={estadisticas.totalPendientes}
            porcentajeCumplimiento={estadisticas.porcentajeCumplimientoATiempo || 0}
            reportesProximos7Dias={estadisticas.reportesProximosVencer7Dias}
          />

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-5">
              <CumplimientoChart
                porcentaje={estadisticas.porcentajeCumplimientoATiempo || 0}
                responsableProblema={estadisticas.responsableMayorIncumplimiento}
                incumplimientosResponsable={estadisticas.incumplimientosResponsableProblema}
              />
            </div>
            <div className="col-span-12 xl:col-span-7">
              <ProximosVencerTable
                reportes={proximosVencer}
                onVerTodos={() => navigate("/calendar")}
              />
            </div>
          </div>

          {vencidos.length > 0 && (
            <VencidosTable
              reportes={vencidos}
              onVerTodos={() => navigate("/reportes-responsables")}
            />
          )}
        </div>
      )}

      {/* AUDITOR */}
      {role === "auditor" && estadisticas && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Panel de Auditoría
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Bienvenido, {user.nombre}. Consulta históricos y métricas.
            </p>
          </div>

          <MetricasReportes
            totalObligaciones={estadisticas.totalObligaciones}
            totalEnviadosATiempo={estadisticas.totalEnviadosATiempo}
            totalVencidos={estadisticas.totalVencidos}
            totalPendientes={estadisticas.totalPendientes}
            porcentajeCumplimiento={estadisticas.porcentajeCumplimientoATiempo || 0}
            reportesProximos7Dias={estadisticas.reportesProximosVencer7Dias}
          />

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
              <CumplimientoChart
                porcentaje={estadisticas.porcentajeCumplimientoATiempo || 0}
                entidadProblema={estadisticas.entidadMayorIncumplimiento}
                incumplimientosEntidad={estadisticas.incumplimientosEntidadProblema}
                responsableProblema={estadisticas.responsableMayorIncumplimiento}
                incumplimientosResponsable={estadisticas.incumplimientosResponsableProblema}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}