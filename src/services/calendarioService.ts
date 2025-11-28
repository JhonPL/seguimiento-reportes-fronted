import api from './api';

// Interface para eventos del calendario
export interface EventoCalendario {
  id: number;
  titulo: string;
  fecha: string;
  start: string;
  end: string;
  estado: string;
  entidad: string;
  responsable: string;
  frecuencia: string;
  periodoReportado: string;
  diasHastaVencimiento: number;
  
  // Colores
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  
  // Prioridad
  prioridad: string;
  
  // Info adicional
  baseLegal?: string;
  formatoRequerido?: string;
  linkInstrucciones?: string;
  observaciones?: string;
  
  // IDs
  reporteId: string;
  entidadId: number;
  responsableElaboracionId: number;
  responsableSupervisionId: number;
}

const calendarioService = {
  /**
   * Obtener eventos del calendario para un mes específico
   */
  obtenerEventos: async (
    mes: string, // formato: YYYY-MM
    entidadId?: number,
    responsableId?: number,
    frecuencia?: string
  ): Promise<EventoCalendario[]> => {
    const params = new URLSearchParams();
    params.append('mes', mes);
    if (entidadId) params.append('entidadId', entidadId.toString());
    if (responsableId) params.append('responsableId', responsableId.toString());
    if (frecuencia) params.append('frecuencia', frecuencia);
    
    const response = await api.get<EventoCalendario[]>(`/calendario/eventos?${params}`);
    return response.data;
  },

  /**
   * Obtener mi calendario (eventos del usuario logueado)
   */
  obtenerMiCalendario: async (mes: string): Promise<EventoCalendario[]> => {
    const response = await api.get<EventoCalendario[]>(`/calendario/mi-calendario?mes=${mes}`);
    return response.data;
  },

  /**
   * Obtener vista anual
   */
  obtenerVistaAnual: async (year: number): Promise<Record<string, EventoCalendario[]>> => {
    const response = await api.get<Record<string, EventoCalendario[]>>(`/calendario/vista-anual?year=${year}`);
    return response.data;
  },

  /**
   * Buscar reportes con filtros avanzados
   */
  buscarReportes: async (filtros: {
    entidadId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    periodoReportado?: string;
    estadoId?: number;
    responsableElaboracionId?: number;
    responsableSupervisionId?: number;
    proceso?: string;
    busquedaLibre?: string;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/calendario/buscar?${params}`);
    return response.data;
  },
};

export default calendarioService;