import api from './api';

export interface Frecuencia {
  id: number;
  nombre: string;
}

const frecuenciaService = {
  /**
   * Listar todas las frecuencias
   */
  listar: async (): Promise<Frecuencia[]> => {
    const response = await api.get<Frecuencia[]>('/frecuencias');
    return response.data;
  },

  /**
   * Obtener frecuencia por ID
   */
  obtenerPorId: async (id: number): Promise<Frecuencia> => {
    const response = await api.get<Frecuencia>(`/frecuencias/${id}`);
    return response.data;
  },
};

export default frecuenciaService;