import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNovedadById, fetchNovedadesPublicadas } from "@/services/noticias.service";
import { TAG_COLORS } from "@/data/constants";
import type { NovedadBackendItem } from "@/types";
import Footer from "./Footer";

function formatFecha(fecha?: string | null): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const DEFAULT_HERO_IMG =
  "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=1200&h=600&fit=crop&auto=format";

export default function NovedadDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [novedad, setNovedad] = useState<NovedadBackendItem | null>(null);
  const [sugeridas, setSugeridas] = useState<NovedadBackendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.all([fetchNovedadById(Number(id)), fetchNovedadesPublicadas()])
      .then(([nov, todas]) => {
        setNovedad(nov);
        // Sugerir las otras novedades distintas a la actual (hasta 2 para el sidebar de 260px)
        setSugeridas(todas.filter((n) => Number(n.ID) !== Number(id)).slice(0, 3));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#E7ECEF] min-h-screen">
        {/* Skeleton hero */}
        <div className="relative h-72 md:h-[440px] bg-[#274C77] animate-pulse">
          <div className="absolute top-6 left-0 right-0">
            <div className="max-w-4xl mx-auto px-6">
              <div className="h-4 w-32 bg-white/20 rounded" />
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0">
            <div className="max-w-4xl mx-auto px-6 space-y-3">
              <div className="h-4 w-28 bg-white/20 rounded" />
              <div className="h-8 md:h-12 w-3/4 bg-white/20 rounded" />
            </div>
          </div>
        </div>

        {/* Skeleton body */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-[1fr_260px] gap-12 items-start">
            <div className="space-y-6">
              <div className="h-10 w-48 bg-[#c0cdd7]/50 rounded" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-[#c0cdd7]/40 rounded w-full" />
                ))}
              </div>
            </div>
            <div className="hidden md:block space-y-4">
              <div className="h-4 w-36 bg-[#c0cdd7]/50 rounded" />
              <div className="h-44 bg-[#c0cdd7]/40 rounded" />
              <div className="h-44 bg-[#c0cdd7]/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !novedad) {
    return (
      <div className="bg-[#E7ECEF] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="font-mono-code text-red-500 text-xs mb-2">// error al cargar novedad</p>
          <p className="text-red-700 text-sm mb-6">{error || "Novedad no encontrada."}</p>
          <button
            onClick={() => navigate("/novedades")}
            className="text-sm font-semibold text-[#274C77] hover:underline"
          >
            ← Volver a noticias
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const tag = novedad.asignaturaNombre || "Tecnología";
  const fechaStr = formatFecha(novedad.fecha_publicacion || novedad.fechaDeCreacion);
  const autorStr = novedad.autorNombre || "Redacción PRoA";
  const imagenHero = novedad.imagen || DEFAULT_HERO_IMG;
  const parrafos = novedad.cuerpo
    ? novedad.cuerpo.split(/\r?\n/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="bg-[#E7ECEF] min-h-screen overflow-x-hidden">
      {/* Hero imagen */}
      <div className="relative h-72 md:h-[440px] bg-[#274C77] overflow-hidden">
        <img
          src={imagenHero}
          alt={novedad.titulo}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/80 via-[#274C77]/30 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6">
            <button
              onClick={() => navigate("/novedades")}
              className="flex items-center gap-2 text-[#A3CEF1] text-sm hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a noticias
            </button>
          </div>
        </div>

        {/* Tag + fecha sobre imagen */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  TAG_COLORS[tag] ?? "bg-white/20 text-white"
                }`}
              >
                {tag}
              </span>
              <span className="font-mono-code text-[#A3CEF1] text-xs">{fechaStr}</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-4xl text-white leading-tight max-w-2xl break-words [overflow-wrap:anywhere]">
              {novedad.titulo}
            </h1>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="grid md:grid-cols-[minmax(0,1fr)_260px] gap-12 items-start w-full">
          {/* Cuerpo del artículo */}
          <article className="min-w-0 w-full overflow-hidden">
            {/* Meta autor */}
            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-[#c0cdd7] min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#274C77] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#A3CEF1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0d1b2a] truncate">{autorStr}</p>
                <p className="font-mono-code text-xs text-[#8B8C89]">publicado el {fechaStr}</p>
              </div>
            </div>

            {/* Párrafos con salto de palabra forzado para textos largos */}
            <div className="flex flex-col gap-5 min-w-0 w-full">
              {parrafos.map((parrafo, i) => (
                <p
                  key={i}
                  className="text-[#0d1b2a] text-base leading-relaxed break-words [overflow-wrap:anywhere]"
                >
                  {parrafo}
                </p>
              ))}
            </div>

            {/* Tags compartir */}
            <div className="mt-10 pt-8 border-t border-[#c0cdd7] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B8C89]">Categoría:</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    TAG_COLORS[tag] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tag}
                </span>
              </div>
              <button
                onClick={() => navigate("/novedades")}
                className="flex items-center gap-2 text-sm font-semibold text-[#274C77] hover:text-[#6096BA] transition-colors"
              >
                ← Ver todas las noticias
              </button>
            </div>
          </article>

          {/* Sidebar — recomendaciones desktop */}
          {sugeridas.length > 0 && (
            <aside className="hidden md:block w-[260px] shrink-0 min-w-0">
              <p className="font-mono-code text-[#6096BA] text-xs mb-4">// también te puede interesar</p>
              <div className="flex flex-col gap-4">
                {sugeridas.map((r) => {
                  const rTag = r.asignaturaNombre || "Tecnología";
                  const rFecha = formatFecha(r.fecha_publicacion || r.fechaDeCreacion);
                  return (
                    <button
                      key={r.ID}
                      onClick={() => {
                        navigate(`/novedades/${r.ID}`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group text-left bg-white border border-[#c0cdd7] rounded-sm overflow-hidden hover:border-[#6096BA] transition-colors shadow-xs w-full"
                    >
                      <div className="aspect-[16/9] overflow-hidden bg-[#dae4ec]">
                        {r.imagen ? (
                          <img
                            src={r.imagen}
                            alt={r.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#274C77]/10 to-[#6096BA]/20">
                            <svg className="w-8 h-8 text-[#6096BA]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                              TAG_COLORS[rTag] ?? "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {rTag}
                          </span>
                          <span className="font-mono-code text-xs text-[#8B8C89]">{rFecha}</span>
                        </div>
                        <p className="font-display font-bold text-sm leading-snug text-[#0d1b2a] group-hover:text-[#274C77] transition-colors line-clamp-3 break-words [overflow-wrap:anywhere]">
                          {r.titulo}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>

        {/* Recomendaciones móvil */}
        {sugeridas.length > 0 && (
          <div className="md:hidden mt-14 min-w-0 w-full">
            <p className="font-mono-code text-[#6096BA] text-xs mb-4">// también te puede interesar</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {sugeridas.map((r) => {
                const rTag = r.asignaturaNombre || "Tecnología";
                const rFecha = formatFecha(r.fecha_publicacion || r.fechaDeCreacion);
                return (
                  <button
                    key={r.ID}
                    onClick={() => {
                      navigate(`/novedades/${r.ID}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group text-left bg-white border border-[#c0cdd7] rounded-sm overflow-hidden hover:border-[#6096BA] transition-colors w-full"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-[#dae4ec]">
                      {r.imagen ? (
                        <img
                          src={r.imagen}
                          alt={r.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#274C77]/10 to-[#6096BA]/20">
                          <svg className="w-8 h-8 text-[#6096BA]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                            TAG_COLORS[rTag] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rTag}
                        </span>
                        <span className="font-mono-code text-xs text-[#8B8C89]">{rFecha}</span>
                      </div>
                      <p className="font-display font-bold text-sm leading-snug group-hover:text-[#274C77] transition-colors line-clamp-3 break-words [overflow-wrap:anywhere]">
                        {r.titulo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
