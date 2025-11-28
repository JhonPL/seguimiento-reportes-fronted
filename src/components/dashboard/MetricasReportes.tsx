import { ArrowUpIcon, ArrowDownIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

interface MetricasProps {
  totalObligaciones: number;
  totalEnviadosATiempo: number;
  totalVencidos: number;
  totalPendientes: number;
  porcentajeCumplimiento: number;
  reportesProximos7Dias: number;
}

export default function MetricasReportes({
  totalObligaciones,
  totalEnviadosATiempo,
  totalVencidos,
  totalPendientes,
  porcentajeCumplimiento,
  reportesProximos7Dias,
}: MetricasProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Total Reportes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Obligaciones
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalObligaciones}
            </h4>
          </div>
          <Badge color="primary">
            Activas
          </Badge>
        </div>
      </div>

      {/* Cumplidos a Tiempo */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cumplidos a Tiempo
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalEnviadosATiempo}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {porcentajeCumplimiento.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Vencidos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/30">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Vencidos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalVencidos}
            </h4>
          </div>
          {totalVencidos > 0 ? (
            <Badge color="error">
              <ArrowDownIcon />
              Crítico
            </Badge>
          ) : (
            <Badge color="success">OK</Badge>
          )}
        </div>
      </div>

      {/* Próximos a Vencer */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900/30">
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Próximos 7 días
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {reportesProximos7Dias}
            </h4>
          </div>
          {reportesProximos7Dias > 0 ? (
            <Badge color="warning">
              Atención
            </Badge>
          ) : (
            <Badge color="success">OK</Badge>
          )}
        </div>
      </div>
    </div>
  );
}