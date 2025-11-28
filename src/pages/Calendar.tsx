import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import calendarioService, { EventoCalendario } from "../services/calendarioService";
import entidadService, { Entidad } from "../services/entidadService";
import frecuenciaService, { Frecuencia } from "../services/frecuenciaService";

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Filtros
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([]);
  const [filterEntidad, setFilterEntidad] = useState<number | undefined>();
  const [filterFrecuencia, setFilterFrecuencia] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Cargar entidades y frecuencias al inicio
  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const [entidadesData, frecuenciasData] = await Promise.all([
          entidadService.listar(),
          frecuenciaService.listar(),
        ]);
        setEntidades(entidadesData.filter(e => e.activo));
        setFrecuencias(frecuenciasData);
      } catch (err) {
        console.error("Error cargando filtros:", err);
      }
    };
    cargarFiltros();
  }, []);

  // Cargar eventos cuando cambia el mes o los filtros
  useEffect(() => {
    if (currentMonth) {
      cargarEventos();
    }
  }, [currentMonth, filterEntidad, filterFrecuencia]);

  const cargarEventos = async () => {
    if (!currentMonth) return;
    
    setLoading(true);
    try {
      const eventosBackend = await calendarioService.obtenerEventos(
        currentMonth,
        filterEntidad,
        undefined,
        filterFrecuencia
      );

      // Transformar eventos para FullCalendar
      const eventosFormateados = eventosBackend.map((evento) => ({
        id: evento.id?.toString(),
        title: evento.titulo,
        start: evento.start || evento.fecha,
        end: evento.end,
        backgroundColor: evento.backgroundColor || getColorByEstado(evento.estado),
        borderColor: evento.borderColor || getColorByEstado(evento.estado),
        textColor: evento.textColor || "#ffffff",
        extendedProps: {
          ...evento,
        },
      }));

      setEvents(eventosFormateados);
    } catch (err) {
      console.error("Error cargando eventos:", err);
      // Si falla, mostrar eventos de ejemplo
      setEvents(getEventosEjemplo());
    } finally {
      setLoading(false);
    }
  };

  const getColorByEstado = (estado: string): string => {
    const estadoLower = estado?.toLowerCase() || "";
    if (estadoLower.includes("vencido")) return "#EF4444"; // Rojo
    if (estadoLower.includes("pendiente")) return "#F59E0B"; // Amarillo
    if (estadoLower.includes("enviado") || estadoLower.includes("cumplido")) return "#10B981"; // Verde
    if (estadoLower.includes("revision")) return "#3B82F6"; // Azul
    return "#6B7280"; // Gris por defecto
  };

  const getEventosEjemplo = () => {
    const hoy = new Date();
    return [
      {
        id: "1",
        title: "📋 Reporte SUI - Calidad",
        start: new Date(hoy.getFullYear(), hoy.getMonth(), 15).toISOString().split("T")[0],
        backgroundColor: "#F59E0B",
        borderColor: "#F59E0B",
        extendedProps: {
          estado: "Pendiente",
          entidad: "SUI",
          responsable: "María García",
          frecuencia: "Mensual",
          diasHastaVencimiento: 5,
        },
      },
      {
        id: "2",
        title: "📋 Informe SSPD - Financiero",
        start: new Date(hoy.getFullYear(), hoy.getMonth(), 20).toISOString().split("T")[0],
        backgroundColor: "#10B981",
        borderColor: "#10B981",
        extendedProps: {
          estado: "Enviado a tiempo",
          entidad: "Superservicios",
          responsable: "Juan Pérez",
          frecuencia: "Trimestral",
          diasHastaVencimiento: 10,
        },
      },
      {
        id: "3",
        title: "📋 Reporte CRA - Tarifas",
        start: new Date(hoy.getFullYear(), hoy.getMonth(), 5).toISOString().split("T")[0],
        backgroundColor: "#EF4444",
        borderColor: "#EF4444",
        extendedProps: {
          estado: "Vencido",
          entidad: "CRA",
          responsable: "María García",
          frecuencia: "Anual",
          diasHastaVencimiento: -3,
        },
      },
    ];
  };

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const date = dateInfo.view.currentStart;
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(yearMonth);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventData = clickInfo.event.extendedProps as EventoCalendario;
    setSelectedEvent({
      ...eventData,
      titulo: clickInfo.event.title,
    } as EventoCalendario);
    openModal();
  };

  const clearFilters = () => {
    setFilterEntidad(undefined);
    setFilterFrecuencia(undefined);
  };

  const getPrioridadBadge = (dias: number) => {
    if (dias < 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">🚨 Vencido</span>;
    }
    if (dias <= 3) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">⚠️ Crítico</span>;
    }
    if (dias <= 7) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">⏰ Próximo</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">✓ A tiempo</span>;
  };

  return (
    <>
      <PageMeta
        title="Calendario de Reportes"
        description="Calendario de vencimientos de reportes regulatorios"
      />
      
      <div className="space-y-4">
        {/* Header con filtros */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              📅 Calendario de Reportes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Visualiza los vencimientos de tus obligaciones regulatorias
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>

            <button
              onClick={cargarEventos}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Entidad
                </label>
                <select
                  value={filterEntidad || ""}
                  onChange={(e) => setFilterEntidad(e.target.value ? Number(e.target.value) : undefined)}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">Todas las entidades</option>
                  {entidades.map((e) => (
                    <option key={e.id} value={e.id}>{e.razonSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Frecuencia
                </label>
                <select
                  value={filterFrecuencia || ""}
                  onChange={(e) => setFilterFrecuencia(e.target.value || undefined)}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">Todas las frecuencias</option>
                  {frecuencias.map((f) => (
                    <option key={f.id} value={f.nombre}>{f.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="h-10 px-4 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Leyenda de colores */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Leyenda:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Vencido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Enviado/Cumplido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">En revisión</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendario */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
              }}
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="auto"
              dayMaxEvents={3}
              moreLinkText={(num) => `+${num} más`}
              eventContent={(eventInfo) => (
                <div className="p-1 text-xs truncate">
                  {eventInfo.event.title}
                </div>
              )}
            />
          </div>
        </div>

        {/* Modal de detalle del evento */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-6 lg:p-8"
        >
          {selectedEvent && (
            <div className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {selectedEvent.titulo}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedEvent.reporteId}
                  </p>
                </div>
                {getPrioridadBadge(selectedEvent.diasHastaVencimiento || 0)}
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedEvent.estado || "Sin estado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Entidad</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedEvent.entidad || "Sin entidad"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Responsable</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedEvent.responsable || "Sin asignar"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Frecuencia</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedEvent.frecuencia || "Sin frecuencia"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha vencimiento</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedEvent.fecha || selectedEvent.start}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Días restantes</p>
                  <p className={`text-sm font-medium ${
                    (selectedEvent.diasHastaVencimiento || 0) < 0 
                      ? "text-red-600" 
                      : (selectedEvent.diasHastaVencimiento || 0) <= 3 
                      ? "text-yellow-600" 
                      : "text-green-600"
                  }`}>
                    {(selectedEvent.diasHastaVencimiento || 0) < 0 
                      ? `${Math.abs(selectedEvent.diasHastaVencimiento || 0)} días vencido`
                      : `${selectedEvent.diasHastaVencimiento || 0} días`
                    }
                  </p>
                </div>
              </div>

              {selectedEvent.periodoReportado && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Periodo reportado</p>
                  <p className="text-sm text-gray-800 dark:text-white/90">
                    {selectedEvent.periodoReportado}
                  </p>
                </div>
              )}

              {selectedEvent.formatoRequerido && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Formato requerido</p>
                  <p className="text-sm text-gray-800 dark:text-white/90">
                    {selectedEvent.formatoRequerido}
                  </p>
                </div>
              )}

              {selectedEvent.linkInstrucciones && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instrucciones</p>
                  <a 
                    href={selectedEvent.linkInstrucciones}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Ver instrucciones →
                  </a>
                </div>
              )}

              {selectedEvent.observaciones && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Observaciones</p>
                  <p className="text-sm text-gray-800 dark:text-white/90">
                    {selectedEvent.observaciones}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Calendar;