import { useState, useRef } from "react";
import { Modal } from "../ui/modal";
import instanciaService, { InstanciaReporteDTO } from "../../services/instanciaService";

interface ModalCorreccionProps {
  isOpen: boolean;
  onClose: () => void;
  instancia: InstanciaReporteDTO | null;
  onCorreccionExitosa: () => void;
}

type ModoCorreccion = "archivo" | "link";

const ModalCorreccion: React.FC<ModalCorreccionProps> = ({
  isOpen,
  onClose,
  instancia,
  onCorreccionExitosa,
}) => {
  const [modo, setModo] = useState<ModoCorreccion>("archivo");
  const [motivo, setMotivo] = useState("");
  const [linkCorreccion, setLinkCorreccion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setModo("archivo");
    setMotivo("");
    setLinkCorreccion("");
    setArchivo(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("El archivo no puede superar los 50MB");
        return;
      }
      setArchivo(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!instancia) return;

    // Validaciones
    if (!motivo.trim()) {
      setError("Debe proporcionar un motivo para la corrección");
      return;
    }

    if (modo === "archivo" && !archivo) {
      setError("Debe seleccionar un archivo de corrección");
      return;
    }

    if (modo === "link" && !linkCorreccion.trim()) {
      setError("Debe proporcionar el link de la corrección");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (modo === "archivo" && archivo) {
        await instanciaService.corregirReporte(instancia.id, archivo, motivo);
      } else {
        await instanciaService.corregirReporteConLink(instancia.id, linkCorreccion, motivo);
      }

      onCorreccionExitosa();
      handleClose();
    } catch (err: any) {
      const mensaje = err.response?.data?.mensaje || 
                      err.response?.data?.error || 
                      err.message || 
                      "Error al agregar la corrección";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  if (!instancia) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl p-0 overflow-hidden">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="px-6 py-4 bg-amber-600">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">
              Agregar Corrección
            </h3>
          </div>
          <p className="text-sm text-amber-100 mt-1">
            {instancia.reporteNombre} - {instancia.periodoReportado}
          </p>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 space-y-5">
          {/* Alerta informativa */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Información importante</p>
                <p className="mt-1 text-blue-700">
                  El archivo original <strong>NO será eliminado</strong>. La corrección se agregará 
                  como un documento adicional para mantener la trazabilidad y auditoría del reporte.
                </p>
              </div>
            </div>
          </div>

          {/* Info del reporte original */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Archivo original</h4>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {instancia.linkReporteFinal ? (
                <a 
                  href={instancia.linkReporteFinal} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {instancia.nombreArchivo || "Ver archivo original"}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Sin archivo adjunto</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enviado el {new Date(instancia.fechaEnvioReal || "").toLocaleDateString("es-CO")} 
              {instancia.enviadoPorNombre && ` por ${instancia.enviadoPorNombre}`}
            </p>
          </div>

          {/* Selector de modo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de corrección
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modo"
                  value="archivo"
                  checked={modo === "archivo"}
                  onChange={() => setModo("archivo")}
                  className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">Subir archivo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modo"
                  value="link"
                  checked={modo === "link"}
                  onChange={() => setModo("link")}
                  className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">Proporcionar link</span>
              </label>
            </div>
          </div>

          {/* Archivo o Link según el modo */}
          {modo === "archivo" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de corrección <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-amber-400 transition-colors">
                <div className="space-y-1 text-center">
                  {archivo ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{archivo.name}</p>
                        <p className="text-xs text-gray-500">
                          {(archivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setArchivo(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none">
                          <span>Seleccionar archivo</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX, ZIP hasta 50MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link de corrección <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={linkCorreccion}
                onChange={(e) => setLinkCorreccion(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          )}

          {/* Motivo (obligatorio) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la corrección <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Describa el motivo por el cual se realiza esta corrección..."
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-600 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Este campo es obligatorio para mantener el registro de auditoría
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Corrección
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalCorreccion;