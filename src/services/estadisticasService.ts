import api from "./api";

export interface EstadisticasDTO {
  totalObligaciones: number;
  totalEnviadosATiempo: number;
  totalVencidos: number;
  totalPendientes: number;
  porcentajeCumplimientoATiempo: number;
  reportesProximosVencer7Dias: number;
  entidadMayorIncumplimiento?: string;
  incumplimientosEntidadProblema?: number;
  responsableMayorIncumplimiento?: string;
  incumplimientosResponsableProblema?: number;
}

export interface ProximosVencerDTO {
  reportes: Array<{
    id: number;
    reporteNombre: string;
    entidadNombre: string;
    periodoReportado: string;
    fechaVencimiento: string;
    diasRestantes: number;
    responsable: string;
  }>;
}

export interface VencidosDTO {
  reportes: Array<{
    id: number;
    reporteNombre: string;
    entidadNombre: string;
    periodoReportado: string;
    fechaVencimiento: string;
    diasVencido: number;
    responsable: string;
  }>;
}

// Interface para el dashboard del auditor
export interface DashboardAuditorDTO {
  // Métricas principales
  total: number;
  enviadosATiempo: number;
  enviadosTarde: number;
  vencidos: number;
  pendientes: number;
  porcentajeCumplimiento: number;
  diasRetrasoPromedio: number;
  
  // Distribución para gráfico de torta
  distribucionEstados: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  
  // Cumplimiento por entidad
  cumplimientoPorEntidad: Array<{
    entidad: string;
    total: number;
    vencidos: number;
    porcentaje: number;
  }>;
  
  // Cumplimiento por responsable
  cumplimientoPorResponsable: Array<{
    responsable: string;
    total: number;
    vencidos: number;
    porcentaje: number;
  }>;
  
  // Tendencia mensual
  tendenciaMensual: Array<{
    mes: string;
    total: number;
    cumplimiento: number;
  }>;
  
  // Años disponibles
  aniosDisponibles: number[];
}

const estadisticasService = {
  // ============ ADMIN - Ve todo ============
  obtenerDashboard: async (): Promise<EstadisticasDTO> => {
    const response = await api.get("/estadisticas/dashboard");
    return response.data;
  },

  obtenerProximosVencer: async (dias: number = 7): Promise<ProximosVencerDTO> => {
    const response = await api.get(`/estadisticas/proximos-vencer?dias=${dias}`);
    return response.data;
  },

  obtenerVencidos: async (): Promise<VencidosDTO> => {
    const response = await api.get("/estadisticas/vencidos");
    return response.data;
  },

  // ============ SUPERVISOR - Solo sus supervisados ============
  obtenerDashboardSupervisor: async (supervisorId: number): Promise<EstadisticasDTO> => {
    const response = await api.get(`/estadisticas/dashboard/supervisor/${supervisorId}`);
    return response.data;
  },

  obtenerProximosVencerSupervisor: async (supervisorId: number, dias: number = 7): Promise<ProximosVencerDTO> => {
    const response = await api.get(`/estadisticas/proximos-vencer/supervisor/${supervisorId}?dias=${dias}`);
    return response.data;
  },

  obtenerVencidosSupervisor: async (supervisorId: number): Promise<VencidosDTO> => {
    const response = await api.get(`/estadisticas/vencidos/supervisor/${supervisorId}`);
    return response.data;
  },

  // ============ RESPONSABLE - Solo sus reportes ============
  obtenerDashboardResponsable: async (responsableId: number): Promise<EstadisticasDTO> => {
    const response = await api.get(`/estadisticas/dashboard/responsable/${responsableId}`);
    return response.data;
  },

  obtenerProximosVencerResponsable: async (responsableId: number, dias: number = 7): Promise<ProximosVencerDTO> => {
    const response = await api.get(`/estadisticas/proximos-vencer/responsable/${responsableId}?dias=${dias}`);
    return response.data;
  },

  // ============ AUDITOR - Dashboard completo ============
  obtenerDashboardAuditor: async (anio?: number, mes?: number, trimestre?: number): Promise<DashboardAuditorDTO> => {
    const params = new URLSearchParams();
    if (anio !== undefined) params.append('anio', anio.toString());
    if (mes !== undefined) params.append('mes', mes.toString());
    if (trimestre !== undefined) params.append('trimestre', trimestre.toString());
    
    const response = await api.get(`/estadisticas/dashboard/auditor?${params}`);
    return response.data;
  },
};

export default estadisticasService;