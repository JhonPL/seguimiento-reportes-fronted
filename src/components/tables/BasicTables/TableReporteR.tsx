import React, { useState } from "react";

export default function TableReporteR() {
  const [reportes, setReportes] = useState([
    {
      id: "RPT-001",
      nombre: "Informe Ambiental",
      entidad: "Ministerio de Ambiente",
      responsable: "Ana Martínez",
      frecuencia: "Trimestral",
      vencimiento: "2025-03-15",
      estado: "Enviado",
    },
    {
      id: "RPT-002",
      nombre: "Informe Financiero",
      entidad: "Superintendencia de Industria",
      responsable: "Juan Pérez",
      frecuencia: "Mensual",
      vencimiento: "2025-02-10",
      estado: "Pendiente",
    },
    {
      id: "RPT-003",
      nombre: "Informe de Seguridad",
      entidad: "Ministerio de Defensa",
      responsable: "Carlos López",
      frecuencia: "Anual",
      vencimiento: "2025-12-31",
      estado: "Vencido",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [isNewReporte, setIsNewReporte] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterFrecuencia, setFilterFrecuencia] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const openModal = (reporte) => {
    setSelectedReporte(reporte);
    setIsNewReporte(false);
    setIsOpen(true);
  };

  const openNewModal = () => {
    setSelectedReporte({
      id: `RPT-${String(reportes.length + 1).padStart(3, "0")}`,
      nombre: "",
      entidad: "",
      responsable: "",
      frecuencia: "Mensual",
      vencimiento: "",
      estado: "Pendiente",
    });
    setIsNewReporte(true);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedReporte(null);
    setIsNewReporte(false);
    setIsOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isNewReporte) {
      setReportes((prev) => [...prev, selectedReporte]);
    } else {
      setReportes((prev) =>
        prev.map((r) => (r.id === selectedReporte.id ? selectedReporte : r))
      );
    }
    closeModal();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEstado("Todos");
    setFilterFrecuencia("Todos");
  };

  // Filtrar reportes
  const filteredReportes = reportes.filter((r) => {
    const matchSearch = 
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEstado = filterEstado === "Todos" || r.estado === filterEstado;
    const matchFrecuencia = filterFrecuencia === "Todos" || r.frecuencia === filterFrecuencia;
    
    return matchSearch && matchEstado && matchFrecuencia;
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      {/* 🔍 Encabezado con título y controles */}
      <div className="mb-4 flex flex-col gap-3 px-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gestión de Reportes
          </h3>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <svg className="stroke-current fill-white dark:fill-gray-800" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.29004 5.90393H17.7067" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M17.7075 14.0961H2.29085" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z" fill="" stroke="" strokeWidth="1.5"></path>
                <path d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z" fill="" stroke="" strokeWidth="1.5"></path>
              </svg>
              Filtros
            </button>
            
            <button
              onClick={openNewModal}
              className="text-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4.16669V15.8334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.16669 10H15.8334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Nuevo Reporte
            </button>
          </div>
        </div>

        {/* Panel de filtros desplegable */}
        {showFilters && (
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex flex-col gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, entidad o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[42px] w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-[42px] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Estado
                  </label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="h-[42px] w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Todos</option>
                    <option>Enviado</option>
                    <option>Pendiente</option>
                    <option>Vencido</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Frecuencia
                  </label>
                  <select
                    value={filterFrecuencia}
                    onChange={(e) => setFilterFrecuencia(e.target.value)}
                    className="h-[42px] w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Todos</option>
                    <option>Mensual</option>
                    <option>Trimestral</option>
                    <option>Anual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredReportes.length} de {reportes.length} reportes
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📋 Tabla */}
      <div className="custom-scrollbar max-w-full overflow-x-auto overflow-y-visible px-5 sm:px-6">
        <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
          <thead className="border-y border-gray-100 text-left text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">ID Reporte</th>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">Nombre</th>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">Entidad</th>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">Responsable</th>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">Frecuencia</th>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">Vencimiento</th>
              <th className="px-4 py-3 whitespace-nowrap font-semibold">Estado</th>
              <th className="px-4 py-3 text-center whitespace-nowrap font-semibold">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredReportes.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron reportes con los filtros aplicados
                </td>
              </tr>
            ) : (
              filteredReportes.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{r.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.nombre}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.entidad}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.responsable}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.frecuencia}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.vencimiento}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.estado === "Enviado"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : r.estado === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => openModal(r)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        setReportes(reportes.filter((rep) => rep.id !== r.id))
                      }
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧱 Modal de edición/creación */}
      {isOpen && selectedReporte && (
        <div className="fixed inset-0 flex items-center justify-center p-5 overflow-y-auto z-[99999]">
          {/* Fondo difuminado */}
          <div
            onClick={closeModal}
            className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
          ></div>

          {/* Contenedor del modal */}
          <div className="relative w-full max-w-[584px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10 z-50 shadow-xl">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="group absolute right-3 top-3 z-50 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition-colors hover:bg-gray-300 hover:text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11"
            >
              <svg
                className="transition-colors fill-current group-hover:text-gray-600 dark:group-hover:text-gray-200"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                ></path>
              </svg>
            </button>

            {/* Formulario */}
            <div>
              <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                {isNewReporte ? "Crear nuevo reporte" : "Editar información del reporte"}
              </h4>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    ID Reporte
                  </label>
                  <input
                    type="text"
                    value={selectedReporte.id}
                    disabled
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                  />
                </div>

                <div className="col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Nombre del reporte *
                  </label>
                  <input
                    type="text"
                    value={selectedReporte.nombre}
                    onChange={(e) =>
                      setSelectedReporte({
                        ...selectedReporte,
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Informe..."
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Entidad *
                  </label>
                  <input
                    type="text"
                    value={selectedReporte.entidad}
                    onChange={(e) =>
                      setSelectedReporte({
                        ...selectedReporte,
                        entidad: e.target.value,
                      })
                    }
                    placeholder="Nombre de la entidad"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Responsable *
                  </label>
                  <input
                    type="text"
                    value={selectedReporte.responsable}
                    onChange={(e) =>
                      setSelectedReporte({
                        ...selectedReporte,
                        responsable: e.target.value,
                      })
                    }
                    placeholder="Nombre del responsable"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div className="col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Frecuencia *
                  </label>
                  <select
                    value={selectedReporte.frecuencia}
                    onChange={(e) =>
                      setSelectedReporte({
                        ...selectedReporte,
                        frecuencia: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Mensual</option>
                    <option>Trimestral</option>
                    <option>Anual</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha de vencimiento *
                  </label>
                  <input
                    type="date"
                    value={selectedReporte.vencimiento}
                    onChange={(e) =>
                      setSelectedReporte({
                        ...selectedReporte,
                        vencimiento: e.target.value,
                      })
                    }
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Estado
                  </label>
                  <select
                    value={selectedReporte.estado}
                    onChange={(e) =>
                      setSelectedReporte({
                        ...selectedReporte,
                        estado: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Enviado</option>
                    <option>Pendiente</option>
                    <option>Vencido</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end w-full gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-600 shadow-theme-xs hover:bg-blue-700 sm:w-auto"
                >
                  {isNewReporte ? "Crear Reporte" : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}