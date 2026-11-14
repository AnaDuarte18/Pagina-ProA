import { useEffect, useState } from "react";
import { fetchEmpresas } from "@/services/empresas.service";
import type { Empresa } from "@/types";

function formatExternalUrl(url?: string | null): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

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
                className="bg-white rounded-xl border border-[#c0cdd7]/80 overflow-hidden shadow-xs flex flex-col"
              >
                {/* Imagen de la empresa */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={
                      empresa.imagen ||
                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&auto=format"
                    }
                    alt={empresa.Nombre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Información: Nombre y descripción */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#274C77] mb-2">
                      {empresa.enlaceExterno ? (
                        <a
                          href={formatExternalUrl(empresa.enlaceExterno)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#6096BA] hover:underline inline-flex items-center gap-1.5 group/link transition-colors"
                          title={`Visitar el sitio web de ${empresa.Nombre}`}
                        >
                          <span>{empresa.Nombre}</span>
                          <svg
                            className="w-4 h-4 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span>{empresa.Nombre}</span>
                      )}
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
