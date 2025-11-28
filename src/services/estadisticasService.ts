import api from './api';

// Interface para las estadísticas del dashboard
export interface EstadisticasDTO {
  // Métricas principales
  totalObligaciones: number;
  totalEnviadosATiempo: number;
  totalEnviadosTarde: number;
  totalVencidos: number;
  totalPendientes: number;
  
  // KPIs
  porcentajeCumplimientoATiempo: number;
  diasRetrasoPromedio: number;
  
  // Identificación de problemas
  entidadMayorIncumplimiento: string;
  incumplimientosEntidadProblema: number;
  responsableMayorIncumplimiento: string;
  incumplimientosResponsableProblema: number;
  
  // Distribución por estado
  distribucionEstados: Record<string, number>;
  
  // Alertas críticas
  alertasCriticasActivas: number;
  reportesProximosVencer7Dias: number;
  reportesProximosVencer3Dias: number;
  
  // Tendencia
  tendenciaMensual: Record<string, number>;
}

export interface ProximoVencer {
  id: string;
  nombre: string;
  entidad: string;
  fechaVencimiento: string;
  diasRestantes: number;
  responsable: string;
}

export interface ReporteVencido {
  id: string;
  nombre: string;
  entidad: string;
  fechaVencimiento: string;
  diasVencido: number;
  responsable: string;
}

const estadisticasService = {
  /**
   * Obtener estadísticas del dashboard
   */
  obtenerDashboard: async (fechaInicio?: string, fechaFin?: string): Promise<EstadisticasDTO> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    
    const url = params.toString() ? `/estadisticas/dashboard?${params}` : '/estadisticas/dashboard';
    const response = await api.get<EstadisticasDTO>(url);
    return response.data;
  },

  /**
   * Obtener distribución de estados
   */
  obtenerDistribucionEstados: async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/estadisticas/distribucion-estados');
    return response.data;
  },

  /**
   * Obtener próximos a vencer
   */
  obtenerProximosVencer: async (dias: number = 7): Promise<any> => {
    const response = await api.get(`/estadisticas/proximos-vencer?dias=${dias}`);
    return response.data;
  },

  /**
   * Obtener reportes vencidos
   */
  obtenerVencidos: async (): Promise<any> => {
    const response = await api.get('/estadisticas/vencidos');
    return response.data;
  },

  /**
   * Obtener tendencia histórica
   */
  obtenerTendenciaHistorica: async (meses: number = 6): Promise<any> => {
    const response = await api.get(`/estadisticas/tendencia-historica?meses=${meses}`);
    return response.data;
  },

  /**
   * Obtener cumplimiento por entidad
   */
  obtenerCumplimientoPorEntidad: async (fechaInicio?: string, fechaFin?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    
    const url = params.toString() ? `/estadisticas/cumplimiento-por-entidad?${params}` : '/estadisticas/cumplimiento-por-entidad';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Obtener cumplimiento por responsable
   */
  obtenerCumplimientoPorResponsable: async (fechaInicio?: string, fechaFin?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    
    const url = params.toString() ? `/estadisticas/cumplimiento-por-responsable?${params}` : '/estadisticas/cumplimiento-por-responsable';
    const response = await api.get(url);
    return response.data;
  },
};

export default estadisticasService;