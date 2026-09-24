import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { CursoItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type TipoPublicacion = "novedad" | "evento" | "material";

interface CrearPublicacionProps {
  onPublicado?: () => void;
  objetoEditar?: any;
  tipoInicial?: TipoPublicacion;
}

export default function CrearPublicacion({ onPublicado, objetoEditar, tipoInicial = "novedad" }: CrearPublicacionProps) {
  const { user, token } = useAuth();
  const [tipo, setTipo] = useState<TipoPublicacion>(tipoInicial);
  const [cursos, setCursos] = useState<CursoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [titulo, setTitulo] = useState(objetoEditar?.titulo || objetoEditar?.Titulo || "");
  const [cuerpo, setCuerpo] = useState(objetoEditar?.cuerpo || objetoEditar?.descripcion || "");
  const [imagenOArchivo, setImagenOArchivo] = useState(objetoEditar?.imagen || objetoEditar?.archivo || "");
  const [fechaEvento, setFechaEvento] = useState(objetoEditar?.fecha_publicacion ? objetoEditar.fecha_publicacion.substring(0, 10) : "");
  const [clasificacionID, setClasificacionID] = useState(objetoEditar?.clasificacionID || 1);
  const [selectedCursos, setSelectedCursos] = useState<number[]>([]);
  const [asignaturaID, setAsignaturaID] = useState<number>(objetoEditar?.asignaturaID || 1);

  // Cargar cursos desde el backend
  useEffect(() => {
    async function loadCursos() {
      try {
        const res = await fetch(`${BASE}/cursos`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setCursos(data);
        } else {
          // Fallback de cursos típicos de PRoA
          setCursos([
            { ID: 1, anio: "1", division: "A/S" },
            { ID: 2, anio: "2", division: "A/S" },
            { ID: 3, anio: "3", division: "A/S" },
            { ID: 4, anio: "4", division: "A/S" },
            { ID: 5, anio: "5", division: "A/S" },
            { ID: 6, anio: "6", division: "A/S" },
            { ID: 7, anio: "7", division: "A/S" },
            { ID: 8, anio: "1", division: "B/F" },
            { ID: 9, anio: "2", division: "B/F" },
            { ID: 10, anio: "3", division: "B/F" },
            { ID: 11, anio: "4", division: "B/F" },
            { ID: 12, anio: "5", division: "B/F" },
            { ID: 13, anio: "6", division: "B/F" },
            { ID: 14, anio: "7", division: "B/F" },
          ]);
        }
      } catch {
        setCursos([
          { ID: 1, anio: "1", division: "A/S" },
          { ID: 4, anio: "4", division: "A/S" },
          { ID: 11, anio: "4", division: "B/F" },
        ]);
      }
    }
    loadCursos();
  }, [token]);

  const toggleCurso = (cursoId: number) => {
    setSelectedCursos((prev) =>
      prev.includes(cursoId) ? prev.filter((id) => id !== cursoId) : [...prev, cursoId]
    );
  };

  const handleSelectAllCursos = () => {
    if (selectedCursos.length === cursos.length) {
      setSelectedCursos([]);
    } else {
      setSelectedCursos(cursos.map((c) => c.ID));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    if (!token) {
      setError("Debés iniciar sesión con rol Docente o Administrador.");
      return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      let payload: any = {};
      const method = objetoEditar?.ID ? "PATCH" : "POST";

      if (tipo === "novedad") {
        endpoint = objetoEditar?.ID ? `${BASE}/novedades/${objetoEditar.ID}` : `${BASE}/novedades`;
        payload = {
          titulo,
          cuerpo,
          imagen: imagenOArchivo || null,
          asignaturaID: asignaturaID || null,
        };
      } else if (tipo === "evento") {
        endpoint = objetoEditar?.ID ? `${BASE}/eventos/${objetoEditar.ID}` : `${BASE}/eventos`;
        if (selectedCursos.length === 0) {
          setError("Los eventos deben tener al menos un curso asignado.");
          setLoading(false);
          return;
        }
        payload = {
          titulo,
          cuerpo,
          fecha_publicacion: fechaEvento || new Date().toISOString(),
          asignaturaID: asignaturaID || null,
          cursoIDs: selectedCursos,
        };
      } else if (tipo === "material") {
        endpoint = objetoEditar?.ID ? `${BASE}/materiales/${objetoEditar.ID}` : `${BASE}/materiales`;
        payload = {
          Titulo: titulo,
          descripcion: cuerpo,
          archivo: imagenOArchivo || "https://ejemplo.com/archivo.pdf",
          clasificacionID: clasificacionID,
          asignaturaIDs: [asignaturaID],
          cursoIDs: selectedCursos, // Vacío = visible para todos los alumnos
        };
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar la solicitud.");
      }

      const msg =
        user?.roleId === 1
          ? "¡Publicación guardada y publicada directamente!"
          : "¡Publicación enviada para revisión del Administrador!";
      setMensajeExito(msg);

      if (!objetoEditar) {
        setTitulo("");
        setCuerpo("");
        setImagenOArchivo("");
        setSelectedCursos([]);
      }

      if (onPublicado) onPublicado();
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#E7ECEF] min-h-[calc(100vh-4rem)] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="bg-[#274C77] text-white p-8 rounded-t-xl shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-1">
                // Gestión de Contenido Académico
              </span>
              <h1 className="text-2xl md:text-3xl font-black">
                {objetoEditar ? "Editar Publicación" : "Crear Nueva Publicación"}
              </h1>
              <p className="text-[#E7ECEF]/80 text-xs md:text-sm mt-1">
                {user?.roleId === 1
                  ? "Como Administrador podés publicar directamente o guardar cambios."
                  : "Como Docente tu publicación pasará a estado Pendiente para revisión del Admin."}
              </p>
            </div>

            {/* Selector de Tipo (Novedad, Evento, Material) */}
            {!objetoEditar && (
              <div className="inline-flex bg-[#1a3050] p-1.5 rounded-lg border border-white/15">
                <button
                  type="button"
                  onClick={() => setTipo("novedad")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all ${
                    tipo === "novedad"
                      ? "bg-[#6096BA] text-white shadow-sm"
                      : "text-[#A3CEF1] hover:text-white"
                  }`}
                >
                  Novedad
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("evento")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all ${
                    tipo === "evento"
                      ? "bg-[#6096BA] text-white shadow-sm"
                      : "text-[#A3CEF1] hover:text-white"
                  }`}
                >
                  Evento
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("material")}
                  className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all ${
                    tipo === "material"
                      ? "bg-[#6096BA] text-white shadow-sm"
                      : "text-[#A3CEF1] hover:text-white"
                  }`}
                >
                  Material de Aula
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-b-xl p-8 shadow-lg border-x border-b border-[#8B8C89]/20">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-300 text-red-700 text-xs p-4 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {mensajeExito && (
            <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-4 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">{mensajeExito}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-xs font-bold text-[#274C77] uppercase tracking-wider mb-1.5">
                Título de la publicación *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={
                  tipo === "novedad"
                    ? "Ej: Hackathon Escolar 2026: Inscripciones Abiertas"
                    : tipo === "evento"
                    ? "Ej: Entrega de Proyecto Integrador de 4° Año"
                    : "Ej: Cuadernillo Práctico de JavaScript & TypeScript"
                }
                className="w-full text-sm px-4 py-3 rounded-lg border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
              />
            </div>

            {/* Asignatura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#274C77] uppercase tracking-wider mb-1.5">
                  Asignatura / Área
                </label>
                <select
                  value={asignaturaID}
                  onChange={(e) => setAsignaturaID(parseInt(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#8B8C89]/30 text-[#0d1b2a] bg-white focus:outline-none focus:border-[#6096BA]"
                >
                  <option value={1}>Programación</option>
                  <option value={2}>Desarrollo Web & Apps</option>
                  <option value={3}>Robótica & IoT</option>
                  <option value={4}>Matemática Aplicada</option>
                  <option value={5}>Ciencias & Tecnología</option>
                </select>
              </div>

              {/* Si es Material: Clasificación */}
              {tipo === "material" && (
                <div>
                  <label className="block text-xs font-bold text-[#274C77] uppercase tracking-wider mb-1.5">
                    Clasificación de material *
                  </label>
                  <select
                    value={clasificacionID}
                    onChange={(e) => setClasificacionID(parseInt(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#8B8C89]/30 text-[#0d1b2a] bg-white focus:outline-none focus:border-[#6096BA]"
                  >
                    <option value={1}>Cuadernillo</option>
                    <option value={2}>Material de clase</option>
                    <option value={3}>Material de lectura</option>
                    <option value={4}>Libro</option>
                  </select>
                </div>
              )}

              {/* Si es Evento: Fecha */}
              {tipo === "evento" && (
                <div>
                  <label className="block text-xs font-bold text-[#274C77] uppercase tracking-wider mb-1.5">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaEvento}
                    onChange={(e) => setFechaEvento(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#8B8C89]/30 text-[#0d1b2a] bg-white focus:outline-none focus:border-[#6096BA]"
                  />
                </div>
              )}
            </div>

            {/* Cuerpo / Descripción */}
            <div>
              <label className="block text-xs font-bold text-[#274C77] uppercase tracking-wider mb-1.5">
                {tipo === "material" ? "Descripción del recurso *" : "Contenido / Cuerpo *"}
              </label>
              <textarea
                required
                rows={5}
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                placeholder="Detalles, indicaciones, temario, objetivos y pautas..."
                className="w-full text-xs px-4 py-3 rounded-lg border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
              ></textarea>
            </div>

            {/* Imagen o URL de archivo */}
            <div>
              <label className="block text-xs font-bold text-[#274C77] uppercase tracking-wider mb-1.5">
                {tipo === "novedad" ? "URL de Imagen (opcional)" : "Enlace al archivo o recurso (PDF/Drive/Repo) *"}
              </label>
              <input
                type="text"
                required={tipo === "material"}
                value={imagenOArchivo}
                onChange={(e) => setImagenOArchivo(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs px-4 py-3 rounded-lg border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
              />
            </div>

            {/* Selección de Cursos (para Eventos y Materiales) */}
            {(tipo === "evento" || tipo === "material") && (
              <div className="p-4 rounded-lg bg-[#E7ECEF]/50 border border-[#8B8C89]/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#274C77] uppercase tracking-wider">
                      Cursos Habilitados {tipo === "evento" ? "(Obligatorio)" : "(Opcional)"}
                    </h3>
                    <p className="text-[11px] text-[#8B8C89]">
                      {tipo === "evento"
                        ? "Solo los alumnos pertenecientes a estos cursos podrán ver el evento en su calendario."
                        : "Dejá sin seleccionar ningún curso si querés que el material sea accesible para todos los alumnos."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllCursos}
                    className="text-xs text-[#6096BA] hover:underline font-semibold"
                  >
                    {selectedCursos.length === cursos.length ? "Deseleccionar todos" : "Seleccionar todos"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {cursos.map((c) => {
                    const isSelected = selectedCursos.includes(c.ID);
                    return (
                      <button
                        key={c.ID}
                        type="button"
                        onClick={() => toggleCurso(c.ID)}
                        className={`text-xs py-2 px-2 rounded-md font-mono-code font-bold transition-colors border text-center ${
                          isSelected
                            ? "bg-[#274C77] text-white border-[#274C77]"
                            : "bg-white text-[#274C77] border-[#8B8C89]/30 hover:bg-[#A3CEF1]/20"
                        }`}
                      >
                        {c.anio}° {c.division}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#274C77] hover:bg-[#6096BA] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-[#A3CEF1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{objetoEditar ? "Guardar Cambios" : "Publicar Contenido"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
