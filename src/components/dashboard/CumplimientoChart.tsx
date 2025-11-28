import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface CumplimientoChartProps {
  porcentaje: number;
  entidadProblema?: string;
  incumplimientosEntidad?: number;
  responsableProblema?: string;
  incumplimientosResponsable?: number;
}

export default function CumplimientoChart({
  porcentaje,
  entidadProblema,
  incumplimientosEntidad,
  responsableProblema,
  incumplimientosResponsable,
}: CumplimientoChartProps) {
  const series = [porcentaje || 0];
  
  const getColor = (pct: number) => {
    if (pct >= 90) return "#10B981"; // Verde
    if (pct >= 70) return "#F59E0B"; // Amarillo
    return "#EF4444"; // Rojo
  };

  const options: ApexOptions = {
    colors: [getColor(porcentaje)],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [getColor(porcentaje)],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Cumplimiento"],
  };

  const getMessage = (pct: number) => {
    if (pct >= 90) return "¡Excelente desempeño! El cumplimiento está en niveles óptimos.";
    if (pct >= 70) return "Buen desempeño, pero hay oportunidades de mejora.";
    if (pct >= 50) return "Se requiere atención. Revise los reportes pendientes.";
    return "¡Alerta! El cumplimiento está muy bajo. Acción inmediata requerida.";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tasa de Cumplimiento
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Reportes entregados a tiempo
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div className="max-h-[330px]">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
            porcentaje >= 90 
              ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
              : porcentaje >= 70 
              ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-500"
              : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
          }`}>
            {porcentaje >= 90 ? "✓ Óptimo" : porcentaje >= 70 ? "⚠ Regular" : "✗ Crítico"}
          </span>
        </div>
        
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {getMessage(porcentaje)}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {entidadProblema && (
          <div className="text-center">
            <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Mayor incumplimiento
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate max-w-[120px]">
              {entidadProblema}
            </p>
            <p className="text-xs text-red-500">{incumplimientosEntidad} pendientes</p>
          </div>
        )}

        {entidadProblema && responsableProblema && (
          <div className="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>
        )}

        {responsableProblema && (
          <div className="text-center">
            <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Responsable crítico
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate max-w-[120px]">
              {responsableProblema}
            </p>
            <p className="text-xs text-red-500">{incumplimientosResponsable} pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
}