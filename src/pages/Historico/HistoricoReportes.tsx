import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import ModalCorreccion from "../../components/common/ModalCorreccion";
import instanciaService, { InstanciaReporteDTO } from "../../services/instanciaService";
import entidadService, { Entidad } from "../../services/entidadService";
import { useAuth } from "../../context/AuthContext";

const HistoricoReportes: React.FC = () => {
  const { user } = useAuth();
  const esAdmin = user?.role === "administrador";

  const [historico, setHistorico] = useState<InstanciaReporteDTO[]>([]);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filterEntidad, setFilterEntidad] = useState<number | undefined>();
  const [filterYear, setFilterYear] = useState<number | undefined>();
  const [filterMes, setFilterMes] = useState<number | undefined>();
  const [busqueda, setBusqueda] = useState("");
  
  // Modal de detalle
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedInstancia, setSelectedInstancia] = useState<InstanciaReporteDTO | null>(null);

  // Modal de corrección
  const [showModalCorreccion, setShowModalCorreccion] = useState(false);
  const [instanciaParaCorregir, setInstanciaParaCorregir] = useState<InstanciaReporteDTO | null>(null);

  // Toast de éxito
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Años disponibles para filtro
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const meses = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  useEffect(() => {
    cargarEntidades();
  }, []);

  useEffect(() => {
    cargarHistorico();
  }, [filterEntidad, filterYear, filterMes]);

  // Auto-ocultar toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const cargarEntidades = async () => {
    try {
      const data = await entidadService.listar();
      setEntidades(data.filter(e => e.activo));
    } catch (err) {
      console.error("Error cargando entidades:", err);
    }
  };

  const cargarHistorico = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instanciaService.listarHistorico({
        entidadId: filterEntidad,
        year: filterYear,
        mes: filterMes,
      });
      setHistorico(data);
    } catch (err) {
      setError("Error al cargar el histórico");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (instancia: InstanciaReporteDTO) => {
    setSelectedInstancia(instancia);
    openModal();
  };

  const abrirModalCorreccion = (instancia: InstanciaReporteDTO) => {
    setInstanciaParaCorregir(instancia);
    setShowModalCorreccion(true);
  };

  const handleCorreccionExitosa = () => {
    setToast({
      show: true,
      message: "Corrección agregada exitosamente. El archivo original se mantiene para auditoría.",
      type: "success"
    });
    cargarHistorico();
    // Si el modal de detalle está abierto, actualizarlo
    if (selectedInstancia && instanciaParaCorregir?.id === selectedInstancia.id) {
      instanciaService.obtenerPorId(selectedInstancia.id).then(setSelectedInstancia);
    }
  };

  const limpiarFiltros = () => {
    setFilterEntidad(undefined);
    setFilterYear(undefined);
    setFilterMes(undefined);
    setBusqueda("");
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFechaHora = (fecha: string | null) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDesviacionBadge = (dias: number | null) => {
    if (dias === null) return null;
    
    if (dias < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {Math.abs(dias)} días antes ✓
        </span>
      );
    }
    if (dias === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          A tiempo ✓
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        {dias} días tarde ⚠
      </span>
    );
  };

  // Filtrar por búsqueda
  const historicoFiltrado = historico.filter(h => {
    if (!busqueda) return true;
    const search = busqueda.toLowerCase();
    return (
      h.reporteNombre.toLowerCase().includes(search) ||
      h.reporteId.toLowerCase().includes(search) ||
      h.entidadNombre.toLowerCase().includes(search) ||
      h.periodoReportado.toLowerCase().includes(search) ||
      (h.enviadoPorNombre && h.enviadoPorNombre.toLowerCase().includes(search))
    );
  });

  return (
    <>
      <PageMeta
        title="Histórico de Reportes"
        description="Consulta el histórico de reportes enviados"
      />

      {/* Toast de notificación */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === "success" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
        }`}>
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className={`text-sm ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>
            {toast.message}
          </span>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {historicoFiltrado.length} registro{historicoFiltrado.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={cargarHistorico}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, código, entidad..."
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Entidad */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Entidad</label>
              <select
                value={filterEntidad || ""}
                onChange={(e) => setFilterEntidad(e.target.value ? Number(e.target.value) : undefined)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Todas</option>
                {entidades.map(e => (
                  <option key={e.id} value={e.id}>{e.razonSocial}</option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Año</label>
              <select
                value={filterYear || ""}
                onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Todos</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Mes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mes</label>
              <select
                value={filterMes || ""}
                onChange={(e) => setFilterMes(e.target.value ? Number(e.target.value) : undefined)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Todos</option>
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón limpiar */}
          {(filterEntidad || filterYear || filterMes || busqueda) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-500">Cargando histórico...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
              <button onClick={cargarHistorico} className="mt-4 text-blue-600 hover:underline">
                Reintentar
              </button>
            </div>
          ) : historicoFiltrado.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay registros</h3>
              <p className="mt-1 text-sm text-gray-500">No se encontraron reportes enviados con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporte
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Envío
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cumplimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enviado por
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {historicoFiltrado.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.reporteNombre}
                          </p>
                          <p className="text-xs text-gray-500">{item.reporteId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.entidadNombre}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.periodoReportado}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{formatFecha(item.fechaEnvioReal)}</p>
                      </td>
                      <td className="px-4 py-4">
                        {getDesviacionBadge(item.diasDesviacion)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.enviadoPorNombre || "Sistema"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.estadoNombre?.toLowerCase().includes("tiempo") 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {item.estadoNombre}
                          </span>
                          {/* Indicador de corrección */}
                          {item.tieneCorreccion && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" title="Tiene corrección">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Corregido
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botón ver detalle */}
                          <button
                            onClick={() => verDetalle(item)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Botón agregar corrección (solo admin) */}
                          {esAdmin && item.puedeCorregir && (
                            <button
                              onClick={() => abrirModalCorreccion(item)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Agregar corrección"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Botón descargar */}
                          {item.linkReporteFinal && (
                            <a
                              href={item.linkReporteFinal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Descargar archivo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {!loading && historicoFiltrado.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{historicoFiltrado.length}</p>
              <p className="text-xs text-blue-600">Total enviados</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-2xl font-bold text-green-700">
                {historicoFiltrado.filter(h => (h.diasDesviacion || 0) <= 0).length}
              </p>
              <p className="text-xs text-green-600">A tiempo</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-2xl font-bold text-red-700">
                {historicoFiltrado.filter(h => (h.diasDesviacion || 0) > 0).length}
              </p>
              <p className="text-xs text-red-600">Con retraso</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-2xl font-bold text-amber-700">
                {historicoFiltrado.filter(h => h.tieneCorreccion).length}
              </p>
              <p className="text-xs text-amber-600">Con corrección</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-2xl p-0 overflow-hidden"
      >
        {selectedInstancia && (
          <div>
            {/* Header */}
            <div className="px-6 py-4 bg-green-600">
              <h3 className="text-lg font-semibold text-white">
                Detalle del Reporte Enviado
              </h3>
              <p className="text-sm text-green-100 mt-1">
                {selectedInstancia.reporteNombre}
              </p>
            </div>

            {/* Contenido */}
            <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Código</p>
                  <p className="text-sm font-medium text-gray-900">{selectedInstancia.reporteId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Entidad</p>
                  <p className="text-sm font-medium text-gray-900">{selectedInstancia.entidadNombre}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Periodo</p>
                  <p className="text-sm font-medium text-gray-900">{selectedInstancia.periodoReportado}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Frecuencia</p>
                  <p className="text-sm font-medium text-gray-900">{selectedInstancia.frecuencia}</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Información de Envío</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Fecha de vencimiento</p>
                    <p className="text-sm font-medium">{formatFecha(selectedInstancia.fechaVencimientoCalculada)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de envío</p>
                    <p className="text-sm font-medium">{formatFechaHora(selectedInstancia.fechaEnvioReal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cumplimiento</p>
                    {getDesviacionBadge(selectedInstancia.diasDesviacion)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Enviado por</p>
                    <p className="text-sm font-medium">{selectedInstancia.enviadoPorNombre || "Sistema"}</p>
                  </div>
                </div>
              </div>

              {/* Responsables */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Responsable Elaboración</p>
                  <p className="text-sm text-gray-900">{selectedInstancia.responsableElaboracion}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Supervisor</p>
                  <p className="text-sm text-gray-900">{selectedInstancia.responsableSupervision}</p>
                </div>
              </div>

              {/* Archivo original */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Archivo Original</h4>
                {selectedInstancia.linkReporteFinal && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <a
                      href={selectedInstancia.linkReporteFinal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {selectedInstancia.nombreArchivo || "Ver archivo original"}
                    </a>
                  </div>
                )}
                
                {selectedInstancia.linkEvidenciaEnvio && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Evidencia de Envío</p>
                    <a
                      href={selectedInstancia.linkEvidenciaEnvio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ver evidencia
                    </a>
                  </div>
                )}
              </div>

              {/* Sección de Corrección */}
              {selectedInstancia.tieneCorreccion && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h4 className="text-sm font-medium text-amber-800">Corrección Registrada</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedInstancia.linkCorreccion && (
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Archivo de corrección</p>
                        <a
                          href={selectedInstancia.linkCorreccion}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {selectedInstancia.nombreArchivoCorreccion || "Ver corrección"}
                        </a>
                      </div>
                    )}
                    
                    {selectedInstancia.motivoCorreccion && (
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Motivo de la corrección</p>
                        <p className="text-sm text-amber-900 bg-white/50 p-2 rounded">
                          {selectedInstancia.motivoCorreccion}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-amber-700">
                      {selectedInstancia.corregidoPorNombre && (
                        <span>Corregido por: {selectedInstancia.corregidoPorNombre}</span>
                      )}
                      {selectedInstancia.fechaCorreccion && (
                        <span>Fecha: {formatFechaHora(selectedInstancia.fechaCorreccion)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {selectedInstancia.observaciones && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Observaciones</p>
                  <p className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg">
                    {selectedInstancia.observaciones}
                  </p>
                </div>
              )}

              {/* Base legal */}
              {selectedInstancia.baseLegal && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Base Legal</p>
                  <p className="text-sm text-gray-700">{selectedInstancia.baseLegal}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              {/* Botón agregar corrección (solo admin y si no tiene corrección) */}
              {esAdmin && selectedInstancia.puedeCorregir && (
                <button
                  onClick={() => {
                    closeModal();
                    abrirModalCorreccion(selectedInstancia);
                  }}
                  className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {selectedInstancia.tieneCorreccion ? "Agregar otra corrección" : "Agregar corrección"}
                </button>
              )}
              <div className="flex-1"></div>
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Corrección */}
      <ModalCorreccion
        isOpen={showModalCorreccion}
        onClose={() => {
          setShowModalCorreccion(false);
          setInstanciaParaCorregir(null);
        }}
        instancia={instanciaParaCorregir}
        onCorreccionExitosa={handleCorreccionExitosa}
      />
    </>
  );
};

export default HistoricoReportes;
