import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEventoById } from "@/services/eventos.service";
import { useAuth } from "@/context/AuthContext";
import type { EventoBackendItem } from "@/types";
import Footer from "./Footer";

function formatFechaCompleta(fecha?: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatHora(fecha?: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
}

export default function EventoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [evento, setEvento] = useState<EventoBackendItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetchEventoById(Number(id), token)
      .then(setEvento)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-[#dae4ec] rounded w-1/4" />
          <div className="h-10 bg-[#dae4ec] rounded w-3/4" />
          <div className="h-40 bg-[#dae4ec] rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-[#dae4ec] rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="font-mono-code text-red-500 text-xs mb-2">// error al cargar evento</p>
        <p className="text-red-700 text-sm mb-6">{error || "Evento no encontrado."}</p>
        <button onClick={() => navigate("/eventos")} className="text-sm font-semibold text-[#274C77] hover:underline">
          ← Volver al calendario
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-[#274C77] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/eventos")}
            className="flex items-center gap-2 text-[#A3CEF1] hover:text-white text-xs font-semibold mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al calendario
          </button>

          {evento.asignaturaNombre && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#A3CEF1]/20 text-[#A3CEF1] border border-[#A3CEF1]/30 mb-4">
              {evento.asignaturaNombre}
            </span>
          )}

          <h1 className="text-2xl md:text-4xl font-black leading-tight mb-6 break-words [overflow-wrap:anywhere]">
            {evento.titulo}
          </h1>

          {/* Fecha y hora destacadas */}
          {evento.fecha_publicacion && (
            <div className="flex items-start gap-6 bg-[#1a3050] rounded-lg p-5 max-w-md">
              <div className="text-center">
                <p className="font-mono-code text-[#A3CEF1] text-xs font-bold uppercase">
                  {new Date(evento.fecha_publicacion).toLocaleDateString("es-AR", { month: "short" }).toUpperCase().replace(".", "")}
                </p>
                <p className="font-display font-black text-5xl text-white leading-none">
                  {new Date(evento.fecha_publicacion).getDate()}
                </p>
                <p className="font-mono-code text-[#A3CEF1] text-xs">
                  {new Date(evento.fecha_publicacion).getFullYear()}
                </p>
              </div>
              <div className="pt-1 min-w-0 flex-1">
                <p className="text-sm font-semibold text-white capitalize break-words">
                  {formatFechaCompleta(evento.fecha_publicacion)}
                </p>
                <p className="font-mono-code text-[#A3CEF1] text-sm mt-1">
                  🕐 {formatHora(evento.fecha_publicacion)}
                </p>
                {evento.autorNombre && (
                  <p className="text-xs text-[#A3CEF1]/70 mt-2 truncate">Publicado por {evento.autorNombre}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <article className="max-w-4xl mx-auto px-6 py-12 min-w-0 w-full overflow-hidden">
        <div className="bg-white rounded-xl border border-[#8B8C89]/20 p-8 shadow-sm break-words [overflow-wrap:anywhere]">
          <h2 className="font-bold text-[#274C77] text-sm uppercase tracking-wider mb-4 font-mono-code">Descripción del evento</h2>
          {evento.cuerpo.split("\n").map((parrafo, i) =>
            parrafo.trim() ? (
              <p key={i} className="mb-4 text-base text-[#374151] leading-relaxed break-words [overflow-wrap:anywhere]">{parrafo}</p>
            ) : (
              <br key={i} />
            )
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-[#8B8C89] font-mono-code">
            Creado: {formatFechaCompleta(evento.fechaDeCreacion)}
          </p>
          <button
            onClick={() => navigate("/eventos")}
            className="text-xs font-semibold text-[#274C77] hover:text-[#6096BA] transition-colors"
          >
            ← Ver todos los eventos
          </button>
        </div>
      </article>

      <Footer />
    </>
  );
}
