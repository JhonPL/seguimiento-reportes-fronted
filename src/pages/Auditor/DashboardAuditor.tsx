import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import estadisticasService, { DashboardAuditorDTO } from "../../services/estadisticasService";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const TRIMESTRES = [
  { label: "Q1 (Ene-Mar)", value: 1 },
  { label: "Q2 (Abr-Jun)", value: 2 },
  { label: "Q3 (Jul-Sep)", value: 3 },
  { label: "Q4 (Oct-Dic)", value: 4 },
];

export default function DashboardAuditor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardAuditorDTO | null>(null);
  
  // Filtros
  const [filtroAnio, setFiltroAnio] = useState<number>(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState<number | null>(null);
  const [filtroTrimestre, setFiltroTrimestre] = useState<number | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [filtroAnio, filtroMes, filtroTrimestre]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await estadisticasService.obtenerDashboardAuditor(
        filtroAnio,
        filtroMes ?? undefined,
        filtroTrimestre ?? undefined
      );
      setData(resultado);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      setError("Error al cargar las estadísticas. Verifique que el backend esté funcionando.");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroMes(null);
    setFiltroTrimestre(null);
  };

  // Seleccionar mes (limpia trimestre)
  const seleccionarMes = (mes: number | null) => {
    setFiltroMes(mes);
    setFiltroTrimestre(null);
  };

  // Seleccionar trimestre (limpia mes)
  const seleccionarTrimestre = (trimestre: number | null) => {
    setFiltroTrimestre(trimestre);
    setFiltroMes(null);
  };

  // Obtener etiqueta del periodo seleccionado
  const getPeriodoLabel = () => {
    if (filtroMes !== null) return `${MESES[filtroMes - 1]} ${filtroAnio}`;
    if (filtroTrimestre !== null) return `${TRIMESTRES[filtroTrimestre - 1].label} ${filtroAnio}`;
    return `Año ${filtroAnio}`;
  };

  // Entidad y responsable con peor cumplimiento
  const peorEntidad = data?.cumplimientoPorEntidad?.[0] || null;
  const peorResponsable = data?.cumplimientoPorResponsable?.[0] || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Dashboard de Auditoría
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Resumen estadístico de cumplimiento • {getPeriodoLabel()}
            </p>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Año */}
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {(data.aniosDisponibles?.length > 0 ? data.aniosDisponibles : [new Date().getFullYear()]).map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>

            {/* Trimestre */}
            <select
              value={filtroTrimestre ?? ""}
              onChange={(e) => seleccionarTrimestre(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los trimestres</option>
              {TRIMESTRES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Mes */}
            <select
              value={filtroMes ?? ""}
              onChange={(e) => seleccionarMes(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los meses</option>
              {MESES.map((mes, idx) => (
                <option key={idx + 1} value={idx + 1}>{mes}</option>
              ))}
            </select>

            {/* Limpiar */}
            {(filtroMes !== null || filtroTrimestre !== null) && (
              <button
                onClick={limpiarFiltros}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs Principales - Primera fila */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* % Cumplimiento a Tiempo - KPI Principal */}
        <div className="col-span-2 md:col-span-1 lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">% Cumplimiento a Tiempo</p>
          <p className="text-4xl font-bold mt-1">{data.porcentajeCumplimiento}%</p>
          <p className="text-xs opacity-75 mt-2">
            (Enviados a tiempo / Total) × 100
          </p>
        </div>

        {/* Total Obligaciones Vencidas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Obligaciones Vencidas</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{data.vencidos}</p>
          <p className="text-xs text-red-500 mt-1">Riesgo de multa</p>
        </div>

        {/* Enviados a Tiempo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Enviados a Tiempo</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{data.enviadosATiempo}</p>
          <p className="text-xs text-green-500 mt-1">Indicador de éxito</p>
        </div>

        {/* Enviados Tarde */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Enviados Tarde</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{data.enviadosTarde}</p>
          <p className="text-xs text-orange-500 mt-1">Riesgo de sanciones</p>
        </div>

        {/* Pendientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pendientes/No Enviados</p>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-300 mt-1">{data.pendientes}</p>
          <p className="text-xs text-gray-500 mt-1">Requieren acción</p>
        </div>
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Días Retraso Promedio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Días Retraso Promedio</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{data.diasRetrasoPromedio}</p>
          <p className="text-xs text-gray-500 mt-1">Debe ser cercano a 0</p>
        </div>

        {/* Total Reportes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Reportes Periodo</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.total}</p>
          <p className="text-xs text-gray-500 mt-1">Universo de obligaciones</p>
        </div>

        {/* Total Entidades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Entidades</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.cumplimientoPorEntidad?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Entidades de control</p>
        </div>

        {/* Total Responsables */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Responsables</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.cumplimientoPorResponsable?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Responsables asignados</p>
        </div>
      </div>

      {/* Entidad y Responsable con mayor incumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entidad con mayor incumplimiento */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Entidad con Mayor Incumplimiento</p>
          </div>
          {peorEntidad ? (
            <>
              <p className="text-lg font-semibold text-gray-800 dark:text-white truncate" title={peorEntidad.entidad}>
                {peorEntidad.entidad}
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-3xl font-bold text-red-600">{peorEntidad.porcentaje}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">cumplimiento</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {peorEntidad.total} reportes • {peorEntidad.vencidos} vencidos
              </p>
            </>
          ) : (
            <p className="text-gray-400">Sin datos</p>
          )}
        </div>

        {/* Responsable con mayor incumplimiento */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Responsable con Mayor Incumplimiento</p>
          </div>
          {peorResponsable ? (
            <>
              <p className="text-lg font-semibold text-gray-800 dark:text-white truncate" title={peorResponsable.responsable}>
                {peorResponsable.responsable}
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-3xl font-bold text-orange-600">{peorResponsable.porcentaje}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">cumplimiento</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {peorResponsable.total} reportes • {peorResponsable.vencidos} vencidos
              </p>
            </>
          ) : (
            <p className="text-gray-400">Sin datos</p>
          )}
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Torta - Distribución de Estado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Distribución por Estado
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            A Tiempo (Verde), Tarde (Amarillo), Vencido (Rojo), Pendiente (Gris)
          </p>
          {data.distribucionEstados && data.distribucionEstados.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.distribucionEstados}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {data.distribucionEstados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Reportes"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {data.distribucionEstados.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400">
              Sin datos para el periodo seleccionado
            </div>
          )}
        </div>

        {/* Tendencia Histórica de Cumplimiento */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Tendencia Histórica de Cumplimiento {filtroAnio}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            % de cumplimiento mes a mes
          </p>
          {data.tendenciaMensual && data.tendenciaMensual.some(m => m.total > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.tendenciaMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, "Cumplimiento"]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="cumplimiento" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400">
              Sin datos para el año seleccionado
            </div>
          )}
        </div>

        {/* Barras - Cumplimiento por Entidad */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Cumplimiento por Entidad
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Ordenado de menor a mayor cumplimiento
          </p>
          {data.cumplimientoPorEntidad && data.cumplimientoPorEntidad.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(280, Math.min(data.cumplimientoPorEntidad.length * 40, 500))}>
              <BarChart data={data.cumplimientoPorEntidad.slice(0, 12)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis 
                  dataKey="entidad" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 10 }} 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => value.length > 25 ? value.substring(0, 25) + "..." : value}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, "Cumplimiento"]}
                />
                <Bar dataKey="porcentaje" radius={[0, 4, 4, 0]}>
                  {data.cumplimientoPorEntidad.slice(0, 12).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.porcentaje >= 80 ? "#10B981" : entry.porcentaje >= 50 ? "#F59E0B" : "#EF4444"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              Sin datos para el periodo seleccionado
            </div>
          )}
        </div>

        {/* Barras - Cumplimiento por Responsable */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Cumplimiento por Responsable
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Ordenado de menor a mayor cumplimiento
          </p>
          {data.cumplimientoPorResponsable && data.cumplimientoPorResponsable.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(280, Math.min(data.cumplimientoPorResponsable.length * 40, 500))}>
              <BarChart data={data.cumplimientoPorResponsable.slice(0, 12)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis 
                  dataKey="responsable" 
                  type="category" 
                  width={140} 
                  tick={{ fontSize: 10 }} 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + "..." : value}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, "Cumplimiento"]}
                  labelFormatter={(label) => {
                    const resp = data.cumplimientoPorResponsable?.find(r => r.responsable === label);
                    return resp ? `${resp.responsable} (${resp.total} reportes, ${resp.vencidos} vencidos)` : label;
                  }}
                />
                <Bar dataKey="porcentaje" radius={[0, 4, 4, 0]}>
                  {data.cumplimientoPorResponsable.slice(0, 12).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.porcentaje >= 80 ? "#10B981" : entry.porcentaje >= 50 ? "#F59E0B" : "#EF4444"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              Sin datos para el periodo seleccionado
            </div>
          )}
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Leyenda de colores en gráficos de barras:</p>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">≥ 80% Cumplimiento (Excelente)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">50-79% Cumplimiento (Regular)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">&lt; 50% Cumplimiento (Crítico)</span>
          </div>
        </div>
      </div>
    </div>
  );
}