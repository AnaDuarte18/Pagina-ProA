import { useState, useEffect } from "react";
import { fetchNovedadesPublicadas } from "@/services/noticias.service";
import type { NovedadBackendItem } from "@/types";
import NovedadCard from "./NovedadCard";
import Footer from "./Footer";

function Skeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden border border-[#c0cdd7] animate-pulse">
          <div className="aspect-[16/10] bg-[#dae4ec]" />
          <div className="p-5 flex flex-col gap-3">
            <div className="h-3 bg-[#dae4ec] rounded w-1/3" />
            <div className="h-4 bg-[#dae4ec] rounded w-full" />
            <div className="h-4 bg-[#dae4ec] rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TablaNovedades() {
  const [novedades, setNovedades] = useState<NovedadBackendItem[]>([]);
  const [filtradas, setFiltradas] = useState<NovedadBackendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [asignaturaFiltro, setAsignaturaFiltro] = useState("");

  useEffect(() => {
    fetchNovedadesPublicadas()
      .then((data) => {
        setNovedades(data);
        setFiltradas(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtrar al cambiar búsqueda o asignatura
  useEffect(() => {
    let resultado = novedades;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (n) => n.titulo.toLowerCase().includes(q) || n.cuerpo?.toLowerCase().includes(q)
      );
    }
    if (asignaturaFiltro) {
      resultado = resultado.filter((n) => n.asignaturaNombre === asignaturaFiltro);
    }
    setFiltradas(resultado);
  }, [busqueda, asignaturaFiltro, novedades]);

  // Asignaturas únicas para el filtro
  const asignaturas = [...new Set(novedades.map((n) => n.asignaturaNombre).filter(Boolean))] as string[];

  return (
    <>
      {/* Hero de sección */}
      <div className="bg-[#274C77] text-white py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Vida estudiantil & Noticias
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            Novedades <span className="text-[#A3CEF1]">de la Escuela</span>
          </h1>
          <p className="text-[#E7ECEF]/80 text-sm max-w-2xl">
            Todas las publicaciones, actividades y noticias de nuestra comunidad educativa.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Buscar novedades..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-[#8B8C89]/30 focus:outline-none focus:border-[#6096BA] bg-white"
          />
          {asignaturas.length > 0 && (
            <select
              value={asignaturaFiltro}
              onChange={(e) => setAsignaturaFiltro(e.target.value)}
              className="text-sm px-4 py-2.5 rounded-lg border border-[#8B8C89]/30 focus:outline-none focus:border-[#6096BA] bg-white min-w-[180px]"
            >
              <option value="">Todas las áreas</option>
              {asignaturas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
        </div>

        {loading && <Skeleton />}

        {error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-8 text-center">
            <p className="font-mono-code text-red-500 text-xs mb-2">// error al cargar novedades</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filtradas.length === 0 && (
          <div className="text-center py-20 text-[#8B8C89]">
            <svg className="w-12 h-12 mx-auto mb-4 text-[#8B8C89]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-mono-code text-xs mb-2">// sin resultados</p>
            <p className="text-sm">No se encontraron novedades{busqueda ? ` para "${busqueda}"` : ""}.</p>
          </div>
        )}

        {!loading && !error && filtradas.length > 0 && (
          <>
            <p className="text-xs text-[#8B8C89] font-mono-code mb-6">
              // {filtradas.length} novedad{filtradas.length !== 1 ? "es" : ""} encontrada{filtradas.length !== 1 ? "s" : ""}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {filtradas.map((n) => (
                <NovedadCard key={n.ID} novedad={n} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
