import api from "./api";

export interface Entidad {
  id?: number;
  nit: string;
  razonSocial: string;
  sigla?: string | null;
  tipoEntidad?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  paginaWeb?: string | null;
  baseLegal?: string | null;
  activo: boolean;
  fechaCreacion?: string | null;
}

const entidadService = {
  listar: async (): Promise<Entidad[]> => {
    const response = await api.get("/entidades");
    return response.data;
  },

  obtener: async (id: number): Promise<Entidad> => {
    const response = await api.get(`/entidades/${id}`);
    return response.data;
  },

  crear: async (entidad: Partial<Entidad>): Promise<Entidad> => {
    const response = await api.post("/entidades", entidad);
    return response.data;
  },

  actualizar: async (id: number, entidad: Partial<Entidad>): Promise<Entidad> => {
    const response = await api.put(`/entidades/${id}`, entidad);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/entidades/${id}`);
  },
};

export default entidadService;