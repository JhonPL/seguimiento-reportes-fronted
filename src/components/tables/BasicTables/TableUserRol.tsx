import { useState, useEffect } from "react";

export default function TableUserRol() {
  const [usuarios, setUsuarios] = useState([
    {
      id: "USR-001",
      nombre: "Carlos Pérez",
      correo: "carlos.perez@empresa.com",
      rol: "Administrador",
      estado: "Activo",
      fecha: "2024-09-12 10:32",
    },
    {
      id: "USR-002",
      nombre: "Ana Rodríguez",
      correo: "ana.rodriguez@empresa.com",
      rol: "Supervisor",
      estado: "Inactivo",
      fecha: "2024-07-01 15:10",
    },
    {
      id: "USR-003",
      nombre: "Luis Martínez",
      correo: "luis.martinez@empresa.com",
      rol: "Responsable",
      estado: "Activo",
      fecha: "2024-08-15 09:20",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [isNewUsuario, setIsNewUsuario] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsNewUsuario(false);
    setIsOpen(true);
    setOpenDropdown(null);
  };

  const openNewModal = () => {
    setSelectedUsuario({
      id: `USR-${String(usuarios.length + 1).padStart(3, "0")}`,
      nombre: "",
      correo: "",
      rol: "Responsable",
      estado: "Activo",
      fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    setIsNewUsuario(true);
    setIsOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    }
    setOpenDropdown(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUsuario(null);
    setIsNewUsuario(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isNewUsuario) {
      setUsuarios((prev) => [...prev, selectedUsuario]);
    } else {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === selectedUsuario.id ? selectedUsuario : u))
      );
    }
    closeModal();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRol("Todos");
    setFilterEstado("Todos");
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch = 
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRol = filterRol === "Todos" || u.rol === filterRol;
    const matchEstado = filterEstado === "Todos" || u.estado === filterEstado;
    
    return matchSearch && matchRol && matchEstado;
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      {/* 🔍 Encabezado */}
      <div className="mb-3 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Gestión de Usuarios y Roles
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
              Nuevo Usuario
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
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[42px] w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-[42px] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Rol
                  </label>
                  <select
                    value={filterRol}
                    onChange={(e) => setFilterRol(e.target.value)}
                    className="h-[42px] w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Todos</option>
                    <option>Administrador</option>
                    <option>Responsable</option>
                    <option>Supervisor</option>
                    <option>Auditor</option>
                  </select>
                </div>

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
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredUsuarios.length} de {usuarios.length} usuarios
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
      <table className="w-full text-sm text-gray-700 dark:text-gray-300">
        <thead className="border-y border-gray-100 text-left text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 font-semibold">Nombre</th>
            <th className="px-3 py-2 font-semibold hidden sm:table-cell">
              Correo
            </th>
            <th className="px-3 py-2 font-semibold text-center">Rol</th>
            <th className="px-3 py-2 font-semibold text-center">Estado</th>
            <th className="px-3 py-2 font-semibold text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredUsuarios.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                No se encontraron usuarios con los filtros aplicados
              </td>
            </tr>
          ) : (
            filteredUsuarios.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-3 py-2 font-medium text-gray-800 dark:text-white">
                  {u.nombre}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Creado: {u.fecha}
                  </p>
                </td>
                <td className="px-3 py-2 hidden sm:table-cell">{u.correo}</td>
                <td className="px-3 py-2 text-center">{u.rol}</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.estado === "Activo"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {u.estado}
                  </span>
                </td>

                {/* ⋯ Menú de opciones */}
                <td className="px-3 py-2 text-center relative">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setOpenDropdown(openDropdown === u.id ? null : u.id);
                    }}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ⋯
                  </button>

                  {openDropdown === u.id && (
                    <div
                      className="absolute right-0 mt-2 w-32 rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 z-10"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(u)}
                        className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🧱 Modal igual al de Entidades */}
      {isOpen && selectedUsuario && (
        <div className="fixed inset-0 flex items-center justify-center p-5 overflow-y-auto z-[99999]">
          {/* Fondo difuminado */}
          <div
            onClick={closeModal}
            className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
          ></div>

          {/* Contenedor modal */}
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

            {/* Formulario React */}
            <div>
              <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                {isNewUsuario ? "Crear nuevo usuario" : "Editar usuario"}
              </h4>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    ID Usuario
                  </label>
                  <input
                    type="text"
                    value={selectedUsuario.id}
                    disabled
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                  />
                </div>

                <div className="col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={selectedUsuario.nombre}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Nombre completo"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Correo *
                  </label>
                  <input
                    type="email"
                    value={selectedUsuario.correo}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        correo: e.target.value,
                      })
                    }
                    placeholder="usuario@empresa.com"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Rol *
                  </label>
                  <select
                    value={selectedUsuario.rol}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        rol: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Administrador</option>
                    <option>Responsable</option>
                    <option>Supervisor</option>
                    <option>Auditor</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Estado
                  </label>
                  <select
                    value={selectedUsuario.estado}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        estado: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

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
                  {isNewUsuario ? "Crear Usuario" : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}