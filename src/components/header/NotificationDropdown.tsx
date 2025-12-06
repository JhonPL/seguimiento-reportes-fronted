import { useState, useEffect, useCallback } from "react";
import alertaService, { AlertaDTO } from "../../services/alertaService";
import { useAuth } from "../../context/AuthContext";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alertas, setAlertas] = useState<AlertaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [countNoLeidas, setCountNoLeidas] = useState(0);
  
  // Modal de detalle
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar contador de no leídas
  const cargarContador = useCallback(async () => {
    try {
      const count = await alertaService.contarNoLeidas();
      setCountNoLeidas(count);
    } catch (error) {
      console.error("Error cargando contador de alertas:", error);
    }
  }, []);

  // Cargar alertas
  const cargarAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alertaService.listarMisAlertasNoLeidas();
      setAlertas(data.slice(0, 10)); // Máximo 10 en el dropdown
      setCountNoLeidas(data.length);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar y cada 60 segundos (backup por si WebSocket falla)
  useEffect(() => {
    cargarContador();
    const interval = setInterval(cargarContador, 60000);
    return () => clearInterval(interval);
  }, [cargarContador]);

  // Cargar alertas cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      cargarAlertas();
    }
  }, [isOpen, cargarAlertas]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Abrir modal con detalle de la alerta
  const handleVerAlerta = (alerta: AlertaDTO) => {
    setAlertaSeleccionada(alerta);
    setShowModal(true);
  };

  // Cerrar modal y marcar como leída
  const handleCerrarModal = async () => {
    if (alertaSeleccionada) {
      try {
        await alertaService.marcarComoLeida(alertaSeleccionada.id);
        setAlertas((prev) => prev.filter((a) => a.id !== alertaSeleccionada.id));
        setCountNoLeidas((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marcando alerta como leída:", error);
      }
    }
    setShowModal(false);
    setAlertaSeleccionada(null);
  };

  // Cerrar modal sin marcar como leída
  const handleCerrarSinMarcar = () => {
    setShowModal(false);
    setAlertaSeleccionada(null);
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await alertaService.marcarTodasComoLeidas();
      setAlertas([]);
      setCountNoLeidas(0);
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  // Obtener color e icono según tipo de alerta
  const getAlertaEstilo = (alerta: AlertaDTO | { tipoAlertaNombre?: string; color?: string }) => {
    const tipo = (alerta as any).tipoAlertaNombre?.toUpperCase() || (alerta as any).tipoAlerta?.toUpperCase() || "";

    if (tipo.includes("VENCID") || tipo.includes("CRÍTICA") || tipo.includes("CRITICA")) {
      return {
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-600 dark:text-red-400",
        borderColor: "border-red-200 dark:border-red-800",
        headerBg: "bg-red-500",
        emoji: "🔴",
      };
    } else if (tipo.includes("URGENTE") || tipo.includes("RIESGO") || tipo.includes("1 DÍA")) {
      return {
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        textColor: "text-orange-600 dark:text-orange-400",
        borderColor: "border-orange-200 dark:border-orange-800",
        headerBg: "bg-orange-500",
        emoji: "🟠",
      };
    } else if (tipo.includes("INTERMEDIA") || tipo.includes("SEGUIMIENTO") || tipo.includes("5 DÍAS")) {
      return {
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-600 dark:text-yellow-400",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        headerBg: "bg-yellow-500",
        emoji: "🟡",
      };
    } else {
      return {
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-600 dark:text-green-400",
        borderColor: "border-green-200 dark:border-green-800",
        headerBg: "bg-green-500",
        emoji: "🟢",
      };
    }
  };

  // Formatear tiempo relativo
  const formatTiempoRelativo = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `${minutos} min`;
    if (horas < 24) return `${horas}h`;
    if (dias < 7) return `${dias}d`;
    return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  };

  // Formatear fecha completa
  const formatFechaCompleta = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-CO", { 
      weekday: "long",
      day: "2-digit", 
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="relative">
      {/* Botón de campana */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {/* Indicador de notificaciones */}
        {countNoLeidas > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {countNoLeidas > 9 ? "9+" : countNoLeidas}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={closeDropdown}
          ></div>

          {/* Panel de notificaciones */}
          <div className="absolute right-0 z-50 w-80 sm:w-96 mt-2 origin-top-right bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-900 dark:border-gray-800">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notificaciones</h3>
                {alertas.length > 0 && (
                  <button
                    onClick={handleMarcarTodasLeidas}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Lista de alertas */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : alertas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    No tienes notificaciones pendientes
                  </p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    ¡Todo está al día! 🎉
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {alertas.map((alerta) => {
                    const estilo = getAlertaEstilo(alerta);
                    return (
                      <li
                        key={alerta.id}
                        className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                          !alerta.leida ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                        }`}
                        onClick={() => handleVerAlerta(alerta)}
                      >
                        <div className="flex gap-3">
                          {/* Icono/Emoji */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${estilo.bgColor}`}>
                            <span className="text-lg">{estilo.emoji}</span>
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                {alerta.tipoAlertaNombre || "Alerta"}
                              </p>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatTiempoRelativo(alerta.fechaProgramada)}
                              </span>
                            </div>
                            
                            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {alerta.reporteNombre}
                              {alerta.periodoReportado && (
                                <span className="text-gray-400"> • {alerta.periodoReportado}</span>
                              )}
                            </p>

                            <p className="mt-1 text-xs text-blue-500 hover:text-blue-600">
                              Click para ver detalle →
                            </p>
                          </div>

                          {/* Indicador no leída */}
                          {!alerta.leida && (
                            <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Ver más en el correo
              </a>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalle de alerta */}
      {showModal && alertaSeleccionada && (
        <>
          {/* Overlay oscuro */}
          <div 
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={handleCerrarSinMarcar}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl dark:bg-gray-800 overflow-hidden">
              {/* Header con color según tipo */}
              <div className={`${getAlertaEstilo(alertaSeleccionada).headerBg} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getAlertaEstilo(alertaSeleccionada).emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {alertaSeleccionada.tipoAlertaNombre || "Notificación"}
                      </h3>
                      <p className="text-sm text-white/80">
                        {formatFechaCompleta(alertaSeleccionada.fechaProgramada)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCerrarSinMarcar}
                    className="p-1 text-white/80 hover:text-white transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="px-6 py-5">
                {/* Reporte */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Reporte
                  </p>
                  <p className="text-base font-semibold text-gray-800 dark:text-white">
                    {alertaSeleccionada.reporteNombre || "Sin nombre"}
                  </p>
                </div>

                {/* Grid de info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {alertaSeleccionada.periodoReportado && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Periodo
                      </p>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {alertaSeleccionada.periodoReportado}
                      </p>
                    </div>
                  )}
                  {alertaSeleccionada.usuarioDestinoNombre && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Destinatario
                      </p>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {alertaSeleccionada.usuarioDestinoNombre}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mensaje */}
                {alertaSeleccionada.mensaje && (
                  <div className={`p-4 rounded-lg ${getAlertaEstilo(alertaSeleccionada).bgColor} ${getAlertaEstilo(alertaSeleccionada).borderColor} border`}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Mensaje
                    </p>
                    <div 
                      className="text-sm text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: alertaSeleccionada.mensaje.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                <button
                  onClick={handleCerrarSinMarcar}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleCerrarModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Marcar como leída
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
