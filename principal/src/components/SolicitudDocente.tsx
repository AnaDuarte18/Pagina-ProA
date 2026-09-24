import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { enviarSolicitudDocente } from "@/services/cursos.service";

interface SolicitudDocenteProps {
  onVolver?: () => void;
}

export default function SolicitudDocente({ onVolver }: SolicitudDocenteProps) {
  const { user, token, updateUser } = useAuth();
  const [asignatura, setAsignatura] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setEnviando(true);
    setMensajeError(null);
    setMensajeExito(null);

    const res = await enviarSolicitudDocente(user.id, token);
    setEnviando(false);

    if (res.success) {
      updateUser({ solicitudDocente: true });
      setMensajeExito(
        "¡Solicitud enviada con éxito! La dirección escolar revisará tu perfil para otorgarte el rol Docente."
      );
    } else {
      setMensajeError(res.message);
    }
  };

  const yaTieneSolicitud = !!user?.solicitudDocente;

  return (
    <div className="bg-[#E7ECEF] min-h-[calc(100vh-4rem)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="bg-[#274C77] text-white rounded-t-xl p-8 md:p-12 shadow-md">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Acreditación de Rol Docente
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            ¿Sos <span className="text-[#A3CEF1]">Docente</span>?
          </h1>
          <p className="text-[#E7ECEF]/90 max-w-2xl text-sm md:text-base leading-relaxed">
            Si te desempeñás como profesor/a en la Escuela PRoA, podés enviar una solicitud
            de acreditación formal para habilitar tus permisos de publicación y administración pedagógica.
          </p>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-b-xl p-8 md:p-12 shadow-lg border-x border-b border-[#8B8C89]/20 space-y-8">
          {/* Alertas */}
          {mensajeExito && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{mensajeExito}</span>
            </div>
          )}

          {mensajeError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{mensajeError}</span>
            </div>
          )}

          {/* Información sobre qué habilita el rol Docente */}
          <div>
            <h2 className="text-xl font-bold text-[#274C77] mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6096BA]"></span>
              ¿Qué herramientas habilita el perfil Docente?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#E7ECEF]/60 border border-[#8B8C89]/20">
                <div className="w-10 h-10 rounded-lg bg-[#274C77] text-white flex items-center justify-center text-lg mb-3">
                  📢
                </div>
                <h3 className="font-bold text-sm text-[#274C77] mb-1">Publicar Novedades</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crear noticias institucionales, novedades de proyectos y comunicados académicos en el muro principal.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#E7ECEF]/60 border border-[#8B8C89]/20">
                <div className="w-10 h-10 rounded-lg bg-[#6096BA] text-white flex items-center justify-center text-lg mb-3">
                  📚
                </div>
                <h3 className="font-bold text-sm text-[#274C77] mb-1">Subir Material Didáctico</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compartir guías, apuntes, cuadernillos y recursos de lectura para los estudiantes de tus materias.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#E7ECEF]/60 border border-[#8B8C89]/20">
                <div className="w-10 h-10 rounded-lg bg-[#274C77] text-white flex items-center justify-center text-lg mb-3">
                  📅
                </div>
                <h3 className="font-bold text-sm text-[#274C77] mb-1">Calendario y Entregas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crear eventos académicos, fechas de exámenes parciales, ferias y talleres curriculares.
                </p>
              </div>
            </div>
          </div>

          {/* Estado de solicitud o formulario de envío */}
          <div className="border-t border-slate-200 pt-8">
            {yaTieneSolicitud ? (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shrink-0">
                    ⏳
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-base">Solicitud en Revisión</h3>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Ya enviaste tu solicitud para el rol Docente. El equipo directivo la está evaluando.
                      Una vez aprobada, tu perfil se actualizará automáticamente con todos los permisos docentes.
                    </p>
                  </div>
                </div>
                {onVolver && (
                  <button
                    onClick={onVolver}
                    className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold shrink-0"
                  >
                    Volver a Inicio
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-[#274C77] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6096BA]"></span>
                  Formulario de Solicitud de Acreditación
                </h2>
                <p className="text-xs text-slate-500">
                  Completá los datos a continuación para enviar tu solicitud al administrador.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Materia / Asignatura que dictás (opcional)
                  </label>
                  <input
                    type="text"
                    value={asignatura}
                    onChange={(e) => setAsignatura(e.target.value)}
                    placeholder="Ej. Programación, Robótica, Matemática..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#274C77]/20 focus:border-[#274C77]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Aclaraciones o Información Institucional (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Detalles sobre tu cargo, turnos o cursos a cargo..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#274C77]/20 focus:border-[#274C77]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="flex-1 bg-[#274C77] hover:bg-[#1a3050] disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm text-center"
                  >
                    {enviando ? "Enviando solicitud..." : "Enviar Solicitud de Acreditación Docente"}
                  </button>
                  {onVolver && (
                    <button
                      type="button"
                      onClick={onVolver}
                      className="px-5 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Volver
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
