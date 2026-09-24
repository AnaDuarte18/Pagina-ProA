import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchCursos, asignarCursoAlumno, enviarSolicitudDocente } from "@/services/cursos.service";
import type { Curso } from "@/mocks/cursos.mock";

interface SeleccionCursoDocenteProps {
  onCompletado: () => void;
}

export default function SeleccionCursoDocente({ onCompletado }: SeleccionCursoDocenteProps) {
  const { user, token, updateUser } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // Selección mutuamente excluyente: 'alumno' | 'docente' | null ("no las dos cosas")
  const [modo, setModo] = useState<"alumno" | "docente" | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);

  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    fetchCursos(token)
      .then((data) => {
        setCursos(data);
        if (data.length > 0) {
          setCursoSeleccionado(data[0].ID);
        }
        setLoadingCursos(false);
      })
      .catch((err) => {
        console.error("Error al cargar cursos:", err);
        setLoadingCursos(false);
      });
  }, [token]);

  // Confirmar selección de curso para Alumno
  const handleConfirmarAlumno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoSeleccionado) {
      setMensajeError("Por favor seleccioná un curso.");
      return;
    }

    setProcesando(true);
    setMensajeError(null);
    setMensajeExito(null);

    const res = await asignarCursoAlumno(cursoSeleccionado, token);
    setProcesando(false);

    if (res.success) {
      const cursoObj = cursos.find((c) => c.ID === cursoSeleccionado);
      if (user) {
        updateUser({
          cursoId: cursoSeleccionado,
          cursoNombre: `${cursoObj?.anio ?? ""} ${cursoObj?.division ?? ""}`.trim(),
        });
        localStorage.setItem(`proa_onboarding_completed_${user.id}`, "true");
        localStorage.setItem(`proa_user_curso_${user.id}`, String(cursoSeleccionado));
      }
      setMensajeExito(
        `¡Excelente! Quedaste registrado en ${cursoObj?.anio} año, división ${cursoObj?.division}.`
      );
      setTimeout(() => {
        onCompletado();
      }, 1500);
    } else {
      setMensajeError(res.message);
    }
  };

  // Enviar solicitud de acreditación como Docente
  const handleEnviarDocente = async () => {
    if (!user) return;

    setProcesando(true);
    setMensajeError(null);
    setMensajeExito(null);

    const res = await enviarSolicitudDocente(user.id, token);
    setProcesando(false);

    if (res.success) {
      updateUser({ solicitudDocente: true });
      localStorage.setItem(`proa_onboarding_completed_${user.id}`, "true");
      setMensajeExito(
        "¡Solicitud enviada con éxito! La administración escolar revisará tu cuenta para habilitarte permisos docentes."
      );
      setTimeout(() => {
        onCompletado();
      }, 1800);
    } else {
      setMensajeError(res.message);
    }
  };

  return (
    <div className="bg-[#E7ECEF] min-h-[calc(100vh-4rem)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="bg-[#274C77] text-white rounded-t-xl p-8 md:p-10 shadow-md text-center">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Configuración de Perfil Institucional
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-3">
            Seleccioná tu <span className="text-[#A3CEF1]">Rol o Curso</span>
          </h1>
          <p className="text-[#E7ECEF]/90 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Para continuar, completá tu vinculación escolar: podés seleccionar tu{" "}
            <strong>curso de alumno</strong> o <strong>solicitar acreditación docente</strong>.
            Solo podés elegir una de las dos opciones.
          </p>
        </div>

        {/* Cuerpo principal */}
        <div className="bg-white rounded-b-xl p-6 md:p-10 shadow-lg border-x border-b border-[#8B8C89]/20">
          {/* Mensajes de feedback */}
          {mensajeExito && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{mensajeExito}</span>
            </div>
          )}

          {mensajeError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{mensajeError}</span>
            </div>
          )}

          {/* Tarjetas de Selección Excluyente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Opción 1: Soy Alumno (Seleccionar Curso) */}
            <div
              onClick={() => {
                if (modo === "alumno") {
                  setModo(null);
                } else {
                  setModo("alumno");
                  setMensajeError(null);
                }
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                modo === "alumno"
                  ? "border-[#274C77] bg-[#A3CEF1]/15 shadow-md ring-2 ring-[#274C77]/20"
                  : modo === "docente"
                  ? "border-slate-200 opacity-50 bg-slate-50 hover:opacity-75"
                  : "border-slate-200 hover:border-[#6096BA] bg-white hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#274C77] text-white flex items-center justify-center font-bold text-xl">
                    🎓
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      modo === "alumno"
                        ? "border-[#274C77] bg-[#274C77]"
                        : "border-slate-300"
                    }`}
                  >
                    {modo === "alumno" && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#274C77] mb-2">
                  Soy Alumno
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Asociá tu cuenta al curso que estás cursando para acceder a los materiales pedagógicos,
                  cronograma y eventos exclusivos de tu división.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <span className="font-mono-code text-xs font-semibold text-[#274C77]">
                  {modo === "alumno" ? "✓ Opción activa" : "Elegir rol Alumno →"}
                </span>
              </div>
            </div>

            {/* Opción 2: Soy Docente (Enviar Solicitud) */}
            <div
              onClick={() => {
                if (modo === "docente") {
                  setModo(null);
                } else {
                  setModo("docente");
                  setMensajeError(null);
                }
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                modo === "docente"
                  ? "border-[#274C77] bg-[#A3CEF1]/15 shadow-md ring-2 ring-[#274C77]/20"
                  : modo === "alumno"
                  ? "border-slate-200 opacity-50 bg-slate-50 hover:opacity-75"
                  : "border-slate-200 hover:border-[#6096BA] bg-white hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6096BA] text-white flex items-center justify-center font-bold text-xl">
                    👨‍🏫
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      modo === "docente"
                        ? "border-[#274C77] bg-[#274C77]"
                        : "border-slate-300"
                    }`}
                  >
                    {modo === "docente" && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#274C77] mb-2">
                  Soy Docente
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Solicitá acceso para publicar novedades, subir apuntes y gestionar contenidos educativos.
                  La dirección validará tu solicitud institucional.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <span className="font-mono-code text-xs font-semibold text-[#274C77]">
                  {modo === "docente" ? "✓ Opción activa" : "Elegir rol Docente →"}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario desplegable según el modo seleccionado */}
          {modo === "alumno" && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-200">
              <h4 className="font-bold text-base text-[#274C77] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6096BA]"></span>
                Seleccioná tu Curso y División
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                El curso determina las fechas de exámenes, entregas y recursos didácticos de tus materias.
              </p>

              {loadingCursos ? (
                <div className="text-sm text-slate-500 py-3">Cargando cursos disponibles...</div>
              ) : (
                <form onSubmit={handleConfirmarAlumno} className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {cursos.map((c) => {
                      const isSel = cursoSeleccionado === c.ID;
                      return (
                        <button
                          key={c.ID}
                          type="button"
                          onClick={() => setCursoSeleccionado(c.ID)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            isSel
                              ? "bg-[#274C77] text-white border-[#274C77] shadow-sm font-bold scale-[1.02]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-[#6096BA] hover:bg-slate-100/50"
                          }`}
                        >
                          <span className="block text-sm">{c.anio} Año</span>
                          <span className="block text-xs opacity-90 font-mono-code">División {c.division}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={procesando || !cursoSeleccionado}
                      className="flex-1 bg-[#274C77] hover:bg-[#1a3050] disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm text-center"
                    >
                      {procesando ? "Guardando curso..." : "Confirmar mi Curso de Alumno"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModo(null)}
                      className="px-5 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {modo === "docente" && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-200 space-y-4">
              <h4 className="font-bold text-base text-[#274C77] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6096BA]"></span>
                Enviar Solicitud de Acreditación Docente
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Al enviar esta solicitud, tu usuario quedará registrado con petición de docente.
                Una vez que un Administrador apruebe tu cuenta, tendrás acceso a las herramientas
                de publicación de novedades, creación de eventos y carga de materiales.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                ⚠️ Recordá que al solicitar rol docente no podrás vincularte como alumno a un curso escolar.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEnviarDocente}
                  disabled={procesando}
                  className="flex-1 bg-[#6096BA] hover:bg-[#274C77] disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm text-center"
                >
                  {procesando ? "Enviando solicitud..." : "Confirmar y Enviar Solicitud Docente"}
                </button>
                <button
                  type="button"
                  onClick={() => setModo(null)}
                  className="px-5 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {!modo && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Hacé clic en una de las tarjetas superiores para habilitar la confirmación correspondiente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
