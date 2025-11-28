import api from './api';
import { Entidad } from './entidadService';
import { Frecuencia } from './frecuenciaService';
import { Usuario } from './usuarioService';

// Interface que coincide con el backend
export interface Reporte {
  id?: string;
  nombre: string;
  entidad: Entidad;
  baseLegal?: string;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
  frecuencia: Frecuencia;
  diaVencimiento?: number;
  mesVencimiento?: number;
  plazoAdicionalDias?: number;
  formatoRequerido?: string;
  linkInstrucciones?: string;
  responsableElaboracion: Usuario;
  responsableSupervision: Usuario;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

// Para crear/actualizar reporte
export interface ReporteRequest {
  id?: string;
  nombre: string;
  entidad: { id: number };
  baseLegal?: string;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
  frecuencia: { id: number };
  diaVencimiento?: number;
  mesVencimiento?: number;
  plazoAdicionalDias?: number;
  formatoRequerido?: string;
  linkInstrucciones?: string;
  responsableElaboracion: { id: number };
  responsableSupervision: { id: number };
  activo: boolean;
}

const reporteService = {
  /**
   * Listar todos los reportes
   */
  listar: async (): Promise<Reporte[]> => {
    const response = await api.get<Reporte[]>('/reportes');
    return response.data;
  },

  /**
   * Obtener reporte por ID
   */
  obtenerPorId: async (id: string): Promise<Reporte> => {
    const response = await api.get<Reporte>(`/reportes/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo reporte
   */
  crear: async (reporte: ReporteRequest): Promise<Reporte> => {
    const response = await api.post<Reporte>('/reportes', reporte);
    return response.data;
  },

  /**
   * Actualizar reporte existente
   */
  actualizar: async (id: string, reporte: ReporteRequest): Promise<Reporte> => {
    const response = await api.put<Reporte>(`/reportes/${id}`, reporte);
    return response.data;
  },

  /**
   * Eliminar reporte
   */
  eliminar: async (id: string): Promise<void> => {
    await api.delete(`/reportes/${id}`);
  },

  /**
   * Listar reportes por entidad
   */
  listarPorEntidad: async (idEntidad: number): Promise<Reporte[]> => {
    const response = await api.get<Reporte[]>(`/reportes/entidad/${idEntidad}`);
    return response.data;
  },

  /**
   * Listar reportes por frecuencia
   */
  listarPorFrecuencia: async (idFrecuencia: number): Promise<Reporte[]> => {
    const response = await api.get<Reporte[]>(`/reportes/frecuencia/${idFrecuencia}`);
    return response.data;
  },
};

export default reporteService;