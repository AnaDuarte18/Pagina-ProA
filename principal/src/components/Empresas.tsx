import { useEffect, useState } from "react";
import { fetchEmpresas } from "@/services/empresas.service";
import type { Empresa } from "@/mocks/empresas.mock";

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchEmpresas()
      .then((data) => {
        if (mounted) {
          setEmpresas(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error al cargar empresas:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white py-16 px-6 border-t border-[#c0cdd7]">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera del componente con título y subtítulo */}
        <div className="mb-12">
          <p className="font-mono-code text-[#6096BA] text-xs mb-2">
            // GET /empresas · Prácticas Profesionalizantes
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-[#274C77] tracking-tight">
            Pasantías
          </h2>
          <p className="text-[#8B8C89] text-base md:text-lg mt-3 max-w-3xl leading-relaxed">
            Convenios institucionales y empresas aliadas que integran a nuestros estudiantes
            en prácticas profesionales formativas de alto impacto tecnológico.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-slate-200 overflow-hidden shadow-xs animate-pulse bg-slate-50"
              >
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : empresas.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
            No hay empresas registradas actualmente.
          </div>
        ) : (
          /* Mapeo de contenidos del endpoint GET /empresas con nombre e imagen */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {empresas.map((empresa) => (
              <div
                key={empresa.ID}
                className="group bg-white rounded-xl border border-[#c0cdd7]/80 hover:border-[#274C77] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Imagen de la empresa */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={
                      empresa.imagen ||
                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&auto=format"
                    }
                    alt={empresa.Nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback en caso de URL rota
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&auto=format";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="font-mono-code text-[11px] font-bold bg-[#274C77]/90 text-white px-2.5 py-1 rounded-full shadow-xs">
                      Pasantía
                    </span>
                  </div>
                </div>

                {/* Información: Nombre y descripción */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#274C77] group-hover:text-[#6096BA] transition-colors mb-2">
                      {empresa.Nombre}
                    </h3>
                    {empresa.Descripcion && (
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {empresa.Descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
