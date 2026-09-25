import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNovedadesRecientes } from "@/services/noticias.service";
import type { NovedadBackendItem } from "@/types";
import NovedadCard from "./NovedadCard";

function Skeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
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

export default function Publicaciones() {
  const navigate = useNavigate();
  const [novedades, setNovedades] = useState<NovedadBackendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNovedadesRecientes(3)
      .then(setNovedades)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="noticias" className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="font-mono-code text-[#6096BA] text-xs mb-2">// últimas publicaciones</p>
          <h2 className="font-display text-4xl md:text-5xl font-black">
            Noticias<br />de la escuela
          </h2>
        </div>
        <button
          onClick={() => navigate("/novedades")}
          className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#274C77] hover:text-[#6096BA] transition-colors"
        >
          Ver todas →
        </button>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-sm p-6 text-center">
          <p className="font-mono-code text-red-500 text-xs mb-1">// error al cargar noticias</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && novedades.length === 0 && (
        <div className="text-center py-16 text-[#8B8C89]">
          <p className="font-mono-code text-xs mb-2">// sin publicaciones</p>
          <p className="text-sm">No hay novedades publicadas todavía.</p>
        </div>
      )}

      {!loading && !error && novedades.length > 0 && (
        <div className="grid md:grid-cols-3 gap-8">
          {novedades.map((n) => (
            <NovedadCard key={n.ID} novedad={n} />
          ))}
        </div>
      )}

      {/* Ver todas (mobile) */}
      {!loading && !error && (
        <div className="mt-8 text-center md:hidden">
          <button
            onClick={() => navigate("/novedades")}
            className="text-sm font-semibold text-[#274C77] hover:text-[#6096BA] transition-colors"
          >
            Ver todas las novedades →
          </button>
        </div>
      )}
    </section>
  );
}
